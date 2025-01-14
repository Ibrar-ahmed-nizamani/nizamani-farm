// app/actions/backup.js
"use server";

import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

export async function createBackup() {
  try {
    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Generate timestamp for unique backup name
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `backup-${timestamp}`);

    // Run mongodump command
    const { stdout, stderr } = await execAsync(
      `mongodump --db farm --out "${backupPath}"`
    );

    // Create zip file
    const zipPath = `${backupPath}.zip`;
    await execAsync(`zip -r "${zipPath}" "${backupPath}"`);

    // Read the zip file
    const zipFile = fs.readFileSync(zipPath);
    const base64Data = zipFile.toString("base64");

    // Clean up temporary files
    fs.rmSync(backupPath, { recursive: true });
    fs.unlinkSync(zipPath);

    return {
      success: true,
      data: base64Data,
      filename: `mongodb-backup-${timestamp}.zip`,
    };
  } catch (error) {
    console.error("Backup error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
