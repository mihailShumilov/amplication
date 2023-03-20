import { namedTypes } from "ast-types";
import { camelCase } from "camel-case";
import {
  DTOs,
  Entity,
  Module,
  NamedClassDeclaration,
  EntityEnumDTOs,
  EntityDTOs,
  EventNames,
  CreateDTOsParams,
} from "@amplication/code-gen-types";
import { getEnumFields } from "../../utils/entity";
import { createEnumName } from "../prisma/create-prisma-schema-fields";
import { createCreateInput } from "./dto/create-create-input";
import { createDTOModule, createDTOModulePath } from "./dto/create-dto-module";
import { createEntityDTO } from "./dto/create-entity-dto";
import { createEnumDTO } from "./dto/create-enum-dto";
import { createEnumDTOModule } from "./dto/create-enum-dto-module";
import { createUpdateInput } from "./dto/create-update-input";
import { createWhereInput } from "./dto/create-where-input";
import { createWhereUniqueInput } from "./dto/create-where-unique-input";
import { createCreateArgs } from "./dto/graphql/create/create-create-args";
import { createDeleteArgs } from "./dto/graphql/delete/create-delete-args";
import { createFindManyArgs } from "./dto/graphql/find-many/create-find-many-args";
import { createFindOneArgs } from "./dto/graphql/find-one/create-find-one-args";
import { createOrderByInput } from "./dto/graphql/order-by-input/order-by-input";
import { createUpdateArgs } from "./dto/graphql/update/create-update-args";
import { createCreateNestedManyDTOs } from "./dto/nested-input-dto/create-nested";
import { createUpdateManyWithoutInputDTOs } from "./dto/nested-input-dto/update-nested";
import { createEntityListRelationFilter } from "./dto/graphql/entity-list-relation-filter/create-entity-list-relation-filter";
import pluginWrapper from "../../plugin-wrapper";
import { createLog } from "../../create-log";

export async function createDTOModules(dtos: DTOs): Promise<Module[]> {
  return pluginWrapper(createDTOModulesInternal, EventNames.CreateDTOs, {
    dtos,
  });
}

/**
 * creating all the DTOs files in the base (only the DTOs)
 *
 */
export function createDTOModulesInternal({ dtos }: CreateDTOsParams): Module[] {
  const dtoNameToPath = getDTONameToPath(dtos);
  return Object.values(dtos).flatMap((entityDTOs) =>
    Object.values(entityDTOs).map((dto) => {
      const isEnumDTO = namedTypes.TSEnumDeclaration.check(dto);
      if (isEnumDTO) {
        return createEnumDTOModule(dto, dtoNameToPath);
      }
      return createDTOModule(dto, dtoNameToPath);
    })
  );
}

export function getDTONameToPath(dtos: DTOs): Record<string, string> {
  return Object.fromEntries(
    Object.entries(dtos).flatMap(([entityName, entityDTOs]) =>
      Object.values(entityDTOs).map((dto) => [
        dto.id.name,
        createDTOModulePath(camelCase(entityName), dto.id.name),
      ])
    )
  );
}

export async function createDTOs(entities: Entity[]): Promise<DTOs> {
  const entitiesDTOsMap = [];
  for (const entity of entities) {
    await createLog({
      level: "info",
      message: `Build DTOs for ${entity.name}`,
    });
    await createLog({ level: "info", message: "createEntityDTOs" });
    const entityDTOs = await createEntityDTOs(entity);
    await createLog({ level: "info", message: "createEntityEnumDTOs" });
    const entityEnumDTOs = createEntityEnumDTOs(entity);
    await createLog({ level: "info", message: "createToManyDTOs" });
    const toManyDTOs = createToManyDTOs(entity);
    const dtos = {
      ...entityDTOs,
      ...entityEnumDTOs,
      ...toManyDTOs,
    };
    entitiesDTOsMap.push([entity.name, dtos]);
  }
  // const entitiesDTOsMap = await Promise.all(
  //   entities.map(async (entity) => {
  //     const entityDTOs = await createEntityDTOs(entity);
  //     const entityEnumDTOs = createEntityEnumDTOs(entity);
  //     const toManyDTOs = createToManyDTOs(entity);
  //     const dtos = {
  //       ...entityDTOs,
  //       ...entityEnumDTOs,
  //       ...toManyDTOs,
  //     };
  //     return [entity.name, dtos];
  //   })
  // );
  return Object.fromEntries(entitiesDTOsMap);
}

async function createEntityDTOs(entity: Entity): Promise<EntityDTOs> {
  await createLog({ level: "info", message: "createEntityDTO" });
  const entityDTO = createEntityDTO(entity);
  await createLog({ level: "info", message: "createCreateInput" });
  const createInput = createCreateInput(entity);
  await createLog({ level: "info", message: "createUpdateInput" });
  const updateInput = createUpdateInput(entity);
  await createLog({ level: "info", message: "createWhereInput" });
  const whereInput = createWhereInput(entity);
  await createLog({ level: "info", message: "createWhereUniqueInput" });
  const whereUniqueInput = createWhereUniqueInput(entity);
  await createLog({ level: "info", message: "createCreateArgs" });
  const createArgs = await createCreateArgs(entity, createInput);
  await createLog({ level: "info", message: "createOrderByInput" });
  const orderByInput = await createOrderByInput(entity);
  await createLog({ level: "info", message: "createDeleteArgs" });
  const deleteArgs = await createDeleteArgs(entity, whereUniqueInput);
  await createLog({ level: "info", message: "createFindManyArgs" });
  const findManyArgs = await createFindManyArgs(
    entity,
    whereInput,
    orderByInput
  );
  await createLog({ level: "info", message: "createFindOneArgs" });
  const findOneArgs = await createFindOneArgs(entity, whereUniqueInput);
  await createLog({ level: "info", message: "createUpdateArgs" });
  const updateArgs = await createUpdateArgs(
    entity,
    whereUniqueInput,
    updateInput
  );
  await createLog({ level: "info", message: "createEntityListRelationFilter" });
  const listRelationFilter = await createEntityListRelationFilter(
    entity,
    whereInput
  );
  const dtos: EntityDTOs = {
    entity: entityDTO,
    createInput,
    updateInput,
    whereInput,
    whereUniqueInput,
    deleteArgs,
    findManyArgs,
    findOneArgs,
    orderByInput,
    listRelationFilter,
  };
  if (createArgs) {
    dtos.createArgs = createArgs;
  }
  if (updateArgs) {
    dtos.updateArgs = updateArgs;
  }
  return dtos;
}

function createEntityEnumDTOs(entity: Entity): EntityEnumDTOs {
  const enumFields = getEnumFields(entity);
  return Object.fromEntries(
    enumFields.map((field) => {
      const enumDTO = createEnumDTO(field, entity);
      return [createEnumName(field, entity), enumDTO];
    })
  );
}

function createToManyDTOs(entity: Entity): NamedClassDeclaration[] {
  const allCreateNestedManyWithoutInput = createCreateNestedManyDTOs(entity);
  const allUpdateManyWithoutInput = createUpdateManyWithoutInputDTOs(entity);
  return [...allCreateNestedManyWithoutInput, ...allUpdateManyWithoutInput];
}
