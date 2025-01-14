// app/actions/backup.ts
"use server";

import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { BackupError, BackupResult } from "./type-definitions";

const execAsync = promisify(exec);

export async function createBackup(): Promise<BackupResult> {
  try {
    // Check if MongoDB tools are installed

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), "backups");
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }

    // Generate timestamp for unique backup name
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `backup-${timestamp}`);

    // Run mongodump command with error handling
    try {
      const { stderr } = await execAsync(
        `mongodump --db farm --out "${backupPath}"`
      );
      if (stderr) {
        console.warn("mongodump warning:", stderr);
      }
    } catch (error) {
      throw new BackupError(
        `Failed to create MongoDB backup: ${
          error instanceof BackupError
            ? error.message
            : "An unexpected error occurred during backup"
        }`
      );
    }

    // Create zip file
    try {
      await execAsync(`zip -r "${backupPath}.zip" "${backupPath}"`);
    } catch (error) {
      // If zip fails, try using PowerShell on Windows
      if (process.platform === "win32") {
        await execAsync(
          `powershell Compress-Archive -Path "${backupPath}" -DestinationPath "${backupPath}.zip"`
        );
      } else {
        throw new BackupError(
          `Failed to create zip file: ${
            error instanceof BackupError
              ? error.message
              : "An unexpected error occurred during backup"
          }`
        );
      }
    }

    // Read the zip file
    const zipPath = `${backupPath}.zip`;
    const zipFile = await fs.readFile(zipPath);
    const base64Data = zipFile.toString("base64");

    // Clean up temporary files
    await fs.rm(backupPath, { recursive: true, force: true });
    await fs.unlink(zipPath);

    return {
      success: true,
      data: base64Data,
      filename: `mongodb-backup-${timestamp}.zip`,
    };
  } catch (error) {
    console.error("Backup error:", error);
    return {
      success: false,
      error:
        error instanceof BackupError
          ? error.message
          : "An unexpected error occurred during backup",
    };
  }
}
