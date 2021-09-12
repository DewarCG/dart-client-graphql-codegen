import { BaseTypesVisitor, ParsedTypesConfig } from '@graphql-codegen/visitor-plugin-common';
import { EnumTypeDefinitionNode, FieldDefinitionNode, GraphQLSchema, InputObjectTypeDefinitionNode, InputValueDefinitionNode, ListTypeNode, NamedTypeNode, NonNullTypeNode, ObjectTypeDefinitionNode } from 'graphql';
import { DartPluginConfig } from './config';
export interface DartPluginParsedConfig extends ParsedTypesConfig {
}
export declare class DartModelVisitor<TRawConfig extends DartPluginConfig = DartPluginConfig, TParsedConfig extends DartPluginParsedConfig = DartPluginParsedConfig> extends BaseTypesVisitor<TRawConfig, TParsedConfig> {
    constructor(schema: GraphQLSchema, pluginConfig: TRawConfig, additionalConfig?: Partial<TParsedConfig>);
    NonNullType(node: NonNullTypeNode): string;
    NamedType(node: NamedTypeNode): string;
    ListType(node: ListTypeNode): string;
    FieldDefinition(node: FieldDefinitionNode, key?: number | string, parent?: any): string;
    InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode, key?: number | string, parent?: any): string;
    private buildDartDocs;
    InputValueDefinition(node: InputValueDefinitionNode, key?: number | string, parent?: any): string;
    ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string, parent: any): string;
    EnumTypeDefinition(node: EnumTypeDefinitionNode): string;
    private getDartType;
}
