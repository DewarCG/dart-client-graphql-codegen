import { BaseTypesVisitor, ParsedTypesConfig } from '@graphql-codegen/visitor-plugin-common';
import { EnumTypeDefinitionNode, FieldDefinitionNode, GraphQLSchema, InputObjectTypeDefinitionNode, InputValueDefinitionNode, ListTypeNode, NamedTypeNode, NonNullTypeNode, ObjectTypeDefinitionNode } from 'graphql';
import { DartPluginConfig } from './config';
export interface DartPluginParsedConfig extends ParsedTypesConfig {
}
export declare class DartMappersVisitor<TRawConfig extends DartPluginConfig = DartPluginConfig, TParsedConfig extends DartPluginParsedConfig = DartPluginParsedConfig> extends BaseTypesVisitor<TRawConfig, TParsedConfig> {
    constructor(schema: GraphQLSchema, pluginConfig: TRawConfig, additionalConfig?: Partial<TParsedConfig>);
    NonNullType(node: NonNullTypeNode): any;
    NamedType(node: NamedTypeNode): any;
    ListType(node: ListTypeNode, key?: any, parent?: any): any;
    ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string, parent: any): string;
    FieldDefinition(node: FieldDefinitionNode, key?: number | string, parent?: any): any;
    InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode, key?: number | string, parent?: any): string;
    private buildDartDocs;
    InputValueDefinition(node: InputValueDefinitionNode, key?: number | string, parent?: any): any;
    EnumTypeDefinition(node: EnumTypeDefinitionNode): string;
    private getDartType;
    private isDartPrimitive;
}
