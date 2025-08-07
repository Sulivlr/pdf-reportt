import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Body,
  Param,
  NotFoundException,
  Res,
  StreamableFile,
} from "@nestjs/common";
import type { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { FilesService } from "./files.service";
import { File } from "@prisma/client";
import { UploadFileDto } from "./upload-file.dto";
import { createReadStream } from "fs";
import path, { join } from "path";
import * as mime from "mime-types";

@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ): Promise<File> {
    return await this.filesService.uploadFile(file, dto.folderId);
  }

  @Get()
  async getAllFiles(): Promise<File[]> {
    return await this.filesService.getAllFiles();
  }

  @Get(":id")
  async getFileById(@Param("id", ParseIntPipe) id: number): Promise<File> {
    const file = await this.filesService.getFileById(id);
    if (!file) {
      throw new NotFoundException(`Файл с id ${id} не найден`);
    }
    return file;
  }

  @Get(":id/download")
  async downloadFile(
    @Param("id", ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.filesService.getFileById(id);
    if (!file) {
      throw new NotFoundException(`Файл с id ${id} не найден`);
    }

    const filePath = path.isAbsolute(file.path)
      ? file.path
      : join(process.cwd(), file.path);

    const fileStream = createReadStream(filePath);

    const safeFileName = encodeURIComponent(file.name);

    res.set({
      "Content-Type": mime.lookup(filePath) || "application/octet-stream",
      "Content-Disposition": `inline; filename*=UTF-8''${safeFileName}`,
      "Cache-Control": "no-cache",
    });

    return new StreamableFile(fileStream);
  }
}
