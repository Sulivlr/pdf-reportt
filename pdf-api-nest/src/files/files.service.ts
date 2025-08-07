import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { File } from "@prisma/client";
import fs from "fs";
import path from "path";

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async uploadFile(file: Express.Multer.File, folderId: number): Promise<File> {
    const rootDir = process.cwd();
    const uploadDir = path.join(rootDir, "uploads");

    const folderExists = await this.prisma.folder.findUnique({
      where: { id: folderId },
    });
    if (!folderExists) {
      throw new Error(`Folder with id ${folderId} not found`);
    }

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const relativePath = path.join("uploads", file.originalname);
    const absolutePath = path.join(rootDir, relativePath);

    fs.writeFileSync(absolutePath, file.buffer);

    return this.prisma.file.create({
      data: {
        name: file.originalname,
        path: relativePath,
        folderId,
      },
    });
  }

  async getAllFiles(): Promise<File[]> {
    return this.prisma.file.findMany();
  }

  async getFileById(id: number): Promise<File | null> {
    return this.prisma.file.findUnique({
      where: { id },
    });
  }
}
