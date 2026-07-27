/**
 * WYN Database Inspector - Report Writer Engine
 * Handles safe file system output generation (JSON, Markdown, Snapshots).
 */

import fs from 'fs/promises';
import path from 'path';
import { OutputFile } from '../types';

export class ReportWriter {
  private readonly outputDirectory: string;

  constructor(outputDirectory: string) {
    this.outputDirectory = outputDirectory;
  }

  /**
   * Ensures the output directory exists before writing reports.
   */
  public async prepareOutputDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.outputDirectory, { recursive: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to create output directory '${this.outputDirectory}': ${message}`
      );
    }
  }

  /**
   * Writes data as pretty-printed JSON file.
   */
  public async writeJson(
    filename: string,
    data: any
  ): Promise<OutputFile> {
    await this.prepareOutputDirectory();

    const normalizedFileName = filename.endsWith('.json')
      ? filename
      : `${filename}.json`;
    const targetPath = path.join(this.outputDirectory, normalizedFileName);
    const content = JSON.stringify(data, null, 2);

    await fs.writeFile(targetPath, content, 'utf-8');
    const stats = await fs.stat(targetPath);

    return {
      filePath: targetPath,
      format: 'json',
      bytesWritten: stats.size,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Writes Markdown string content to file.
   */
  public async writeMarkdown(
    filename: string,
    content: string
  ): Promise<OutputFile> {
    await this.prepareOutputDirectory();

    const normalizedFileName = filename.endsWith('.md')
      ? filename
      : `${filename}.md`;
    const targetPath = path.join(this.outputDirectory, normalizedFileName);

    await fs.writeFile(targetPath, content, 'utf-8');
    const stats = await fs.stat(targetPath);

    return {
      filePath: targetPath,
      format: 'markdown',
      bytesWritten: stats.size,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Writes plain text string content to file.
   */
  public async writeText(
    filename: string,
    content: string
  ): Promise<OutputFile> {
    await this.prepareOutputDirectory();

    const normalizedFileName = filename.endsWith('.txt')
      ? filename
      : `${filename}.txt`;
    const targetPath = path.join(this.outputDirectory, normalizedFileName);

    await fs.writeFile(targetPath, content, 'utf-8');
    const stats = await fs.stat(targetPath);

    return {
      filePath: targetPath,
      format: 'text',
      bytesWritten: stats.size,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Writes a schema/data snapshot file (formatted JSON or structured snapshot text).
   */
  public async writeSnapshot(
    filename: string,
    data: string | object
  ): Promise<OutputFile> {
    await this.prepareOutputDirectory();

    const extension = typeof data === 'string' ? '.snap' : '.snapshot.json';
    const normalizedFileName = filename.endsWith('.snap') || filename.endsWith('.snapshot.json')
      ? filename
      : `${filename}${extension}`;
    
    const targetPath = path.join(this.outputDirectory, normalizedFileName);
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

    await fs.writeFile(targetPath, content, 'utf-8');
    const stats = await fs.stat(targetPath);

    return {
      filePath: targetPath,
      format: 'snapshot',
      bytesWritten: stats.size,
      createdAt: new Date().toISOString(),
    };
  }
}
