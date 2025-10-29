import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/content_scribe';
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MAX_BACKUPS = 7; // Keep last 7 backups

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

  console.log(`Creating backup at ${backupPath}...`);

  try {
    // Create MongoDB dump
    const { stdout, stderr } = await execAsync(
      `mongodump --uri="${MONGO_URI}" --out="${backupPath}"`
    );

    if (stderr) {
      console.error('Backup warnings:', stderr);
    }

    console.log('✅ Backup completed successfully:', backupPath);

    // Cleanup old backups
    await cleanupOldBackups();

    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  }
}

async function cleanupOldBackups() {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(name => name.startsWith('backup-'))
      .map(name => ({
        name,
        path: path.join(BACKUP_DIR, name),
        time: fs.statSync(path.join(BACKUP_DIR, name)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    // Remove old backups beyond MAX_BACKUPS
    if (backups.length > MAX_BACKUPS) {
      const toRemove = backups.slice(MAX_BACKUPS);
      for (const backup of toRemove) {
        console.log(`Removing old backup: ${backup.name}`);
        fs.rmSync(backup.path, { recursive: true, force: true });
      }
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error.message);
  }
}

async function restoreBackup(backupName) {
  const backupPath = path.join(BACKUP_DIR, backupName);

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup not found: ${backupName}`);
  }

  console.log(`Restoring backup from ${backupPath}...`);

  try {
    const { stdout, stderr } = await execAsync(
      `mongorestore --uri="${MONGO_URI}" --drop "${backupPath}"`
    );

    if (stderr) {
      console.error('Restore warnings:', stderr);
    }

    console.log('✅ Restore completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    throw error;
  }
}

function listBackups() {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(name => name.startsWith('backup-'))
      .map(name => ({
        name,
        path: path.join(BACKUP_DIR, name),
        created: fs.statSync(path.join(BACKUP_DIR, name)).mtime
      }))
      .sort((a, b) => b.created.getTime() - a.created.getTime());

    console.log('\n📦 Available backups:');
    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.name} (${backup.created.toLocaleString()})`);
    });

    return backups;
  } catch (error) {
    console.error('Error listing backups:', error.message);
    return [];
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'create':
    createBackup()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;

  case 'restore':
    const backupName = process.argv[3];
    if (!backupName) {
      console.error('Usage: node backup.js restore <backup-name>');
      listBackups();
      process.exit(1);
    }
    restoreBackup(backupName)
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;

  case 'list':
    listBackups();
    process.exit(0);
    break;

  default:
    console.log('Usage:');
    console.log('  node backup.js create          - Create a new backup');
    console.log('  node backup.js restore <name>  - Restore from a backup');
    console.log('  node backup.js list            - List all backups');
    process.exit(1);
}

export { createBackup, restoreBackup, listBackups };
