import { PrismaService } from "../../prisma/prisma.service";

import {
  // @ts-ignore
  Prisma,
  // @ts-ignore
  RELATED_ENTITY,
} from "generated-prisma-client";

export class Mixin {
  constructor(protected readonly prisma: PrismaService) {}

  async FIND_MANY(
    parentId: string,
    args: Prisma.ARGS
  ): Promise<RELATED_ENTITY[]> {
    return this.prisma.DELEGATE.findUniqueOrThrow({
      where: { id: parentId },
    }).PROPERTY(args);
  }
}