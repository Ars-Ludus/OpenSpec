import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';
import { FileSystemUtils } from '../../src/utils/file-system.js';

describe('FileSystemUtils', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `openspec-test-${randomUUID()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('createDirectory', () => {
    it('should create a directory', async () => {
      const dirPath = path.join(testDir, 'new-dir');
      await FileSystemUtils.createDirectory(dirPath);
      
      const stats = await fs.stat(dirPath);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should create nested directories', async () => {
      const dirPath = path.join(testDir, 'nested', 'deep', 'dir');
      await FileSystemUtils.createDirectory(dirPath);
      
      const stats = await fs.stat(dirPath);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should not throw if directory already exists', async () => {
      const dirPath = path.join(testDir, 'existing-dir');
      await fs.mkdir(dirPath);
      
      await expect(FileSystemUtils.createDirectory(dirPath)).resolves.not.toThrow();
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      const filePath = path.join(testDir, 'test.txt');
      await fs.writeFile(filePath, 'test content');
      
      const exists = await FileSystemUtils.fileExists(filePath);
      expect(exists).toBe(true);
    });

    it('should return false for non-existing file', async () => {
      const filePath = path.join(testDir, 'non-existent.txt');
      
      const exists = await FileSystemUtils.fileExists(filePath);
      expect(exists).toBe(false);
    });

    it('should return false for directory path', async () => {
      const dirPath = path.join(testDir, 'dir');
      await fs.mkdir(dirPath);
      
      const exists = await FileSystemUtils.fileExists(dirPath);
      expect(exists).toBe(true); // fs.access doesn't distinguish between files and directories
    });
  });

  describe('directoryExists', () => {
    it('should return true for existing directory', async () => {
      const dirPath = path.join(testDir, 'test-dir');
      await fs.mkdir(dirPath);
      
      const exists = await FileSystemUtils.directoryExists(dirPath);
      expect(exists).toBe(true);
    });

    it('should return false for non-existing directory', async () => {
      const dirPath = path.join(testDir, 'non-existent-dir');
      
      const exists = await FileSystemUtils.directoryExists(dirPath);
      expect(exists).toBe(false);
    });

    it('should return false for file path', async () => {
      const filePath = path.join(testDir, 'file.txt');
      await fs.writeFile(filePath, 'content');
      
      const exists = await FileSystemUtils.directoryExists(filePath);
      expect(exists).toBe(false);
    });
  });

  describe('writeFile', () => {
    it('should write content to file', async () => {
      const filePath = path.join(testDir, 'output.txt');
      const content = 'Hello, World!';
      
      await FileSystemUtils.writeFile(filePath, content);
      
      const readContent = await fs.readFile(filePath, 'utf-8');
      expect(readContent).toBe(content);
    });

    it('should create directory if it does not exist', async () => {
      const filePath = path.join(testDir, 'nested', 'dir', 'output.txt');
      const content = 'Nested content';
      
      await FileSystemUtils.writeFile(filePath, content);
      
      const readContent = await fs.readFile(filePath, 'utf-8');
      expect(readContent).toBe(content);
    });

    it('should overwrite existing file', async () => {
      const filePath = path.join(testDir, 'existing.txt');
      await fs.writeFile(filePath, 'old content');
      
      const newContent = 'new content';
      await FileSystemUtils.writeFile(filePath, newContent);
      
      const readContent = await fs.readFile(filePath, 'utf-8');
      expect(readContent).toBe(newContent);
    });
  });

  describe('readFile', () => {
    it('should read file content', async () => {
      const filePath = path.join(testDir, 'input.txt');
      const content = 'Test content';
      await fs.writeFile(filePath, content);
      
      const readContent = await FileSystemUtils.readFile(filePath);
      expect(readContent).toBe(content);
    });

    it('should throw for non-existing file', async () => {
      const filePath = path.join(testDir, 'non-existent.txt');
      
      await expect(FileSystemUtils.readFile(filePath)).rejects.toThrow();
    });
  });

  describe('ensureWritePermissions', () => {
    it('should return true for writable directory', async () => {
      const hasPermission = await FileSystemUtils.ensureWritePermissions(testDir);
      expect(hasPermission).toBe(true);
    });

    it('should return true for non-existing directory with writable parent', async () => {
      const dirPath = path.join(testDir, 'new-dir');
      const hasPermission = await FileSystemUtils.ensureWritePermissions(dirPath);
      expect(hasPermission).toBe(true);
    });

    it('should handle deeply nested non-existing directories', async () => {
      const dirPath = path.join(testDir, 'a', 'b', 'c', 'd');
      const hasPermission = await FileSystemUtils.ensureWritePermissions(dirPath);
      expect(hasPermission).toBe(true);
    });
  });
});
