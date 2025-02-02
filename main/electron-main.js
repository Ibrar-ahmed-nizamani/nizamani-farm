// main/electron-main.js
import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import MongoDBService from "./mongodb-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let mongoService;

const isDev = !app.isPackaged;

const createWindow = async () => {
  try {
    // Start MongoDB
    mongoService = new MongoDBService();
    await mongoService.start();

    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    if (isDev) {
      // Wait for Next.js server in development
      const tryConnection = async (retries = 0) => {
        try {
          const response = await fetch("http://localhost:3000");
          if (response.ok) {
            await mainWindow.loadURL("http://localhost:3000");
            mainWindow.webContents.openDevTools();
            console.log("Development: Loaded from localhost:3000");
          }
        } catch (error) {
          if (retries < 30) {
            // Try for 30 seconds
            console.log("Waiting for Next.js server...");
            setTimeout(() => tryConnection(retries + 1), 1000);
          } else {
            console.error("Failed to connect to Next.js server");
            app.quit();
          }
        }
      };

      await tryConnection();
    }

    mainWindow.on("closed", async () => {
      if (mongoService) {
        await mongoService.stop();
      }
      mainWindow = null;
    });
  } catch (error) {
    console.error("Error creating window:", error);
    if (mainWindow) {
      mainWindow.close();
    }
    app.quit();
  }
};

app.whenReady().then(createWindow);

app.on("window-all-closed", async () => {
  if (mongoService) {
    await mongoService.stop();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle errors globally
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});
