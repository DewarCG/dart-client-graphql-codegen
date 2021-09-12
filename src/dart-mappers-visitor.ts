import {
  BaseTypesVisitor,
  indent,
  ParsedTypesConfig,
  transformComment,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import {
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  Kind,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
} from 'graphql';
import { DartPluginConfig } from './config';

export interface DartPluginParsedConfig extends ParsedTypesConfig {}

export class DartMappersVisitor<
  TRawConfig extends DartPluginConfig = DartPluginConfig,
  TParsedConfig extends DartPluginParsedConfig = DartPluginParsedConfig
> extends BaseTypesVisitor<TRawConfig, TParsedConfig> {
  constructor(
    schema: GraphQLSchema,
    pluginConfig: TRawConfig,
    additionalConfig: Partial<TParsedConfig> = {}
  ) {
    super(schema, pluginConfig, {} as TParsedConfig);

    autoBind(this);
  }

  override NonNullType(node: NonNullTypeNode): any {
    const type = node.type as any;
    let result: string = type.result;
    result = result.replace('?', '');
    result = this.getDartType(result);
    return {
      result,
      mapper: type.mapper,
      isObjectList: type.isObjectList,
    };
  }

  override NamedType(node: NamedTypeNode): any {
    let type = this.getDartType(node.name as any as string);
    let mapper = undefined;
    let nullMapper = undefined;
    let isObject = false;
    if (!this.isDartPrimitive(type)) {
      mapper = {
        fromMap: [`final {{field}} = ${type}Mapper().fromMap({{parameter}});`],
        toMap: [`final {{field}} = ${type}Mapper().toMap({{parameter}});`],
      };
      nullMapper = {
        toMap: [
          `Map<String, dynamic>? {{field}};`,
          `if (input.{{field}} != null) {`,
          indent(`{{field}} = ${type}Mapper().toMap(input.{{field}});`),
          `}`,
        ],
        fromMap: [
          `${type}? {{field}};`,
          `if (map['{{field}}'] != null) {`,
          indent(`{{field}} = ${type}Mapper().fromMap(map['{{field}}']);`),
          `}`,
        ],
      };
      isObject = true;
    }
    type = type + '?';
    return {
      result: type,
      mapper,
      nullMapper,
      isObject,
    };
  }

  override ListType(node: ListTypeNode, key?, parent?): any {
    const type = node.type;
    const typeName = (type as any).result;
    let mapper: any;
    let nullMapper: any;
    let isObjectList = false;
    if (!this.isDartPrimitive(typeName)) {
      const mapperSuffixName = typeName.replace('?', '');
      const common = `{{field}}List = List<${typeName}>.of(map['{{field}}']).map((it) => ${mapperSuffixName}Mapper().fromMap(it)).toList();`;
      const common2 = `{{field}}List = input.{{field}}.map((it) => ${mapperSuffixName}Mapper().toMap(it)).toList();`;
      const mapOptional = typeName.includes('?') ? '?': ''
      mapper = {
        fromMap: [`final ${common}`],
        toMap: [`final ${common2}`],
      };
      nullMapper = {
        fromMap: [
          `List<${typeName}>? {{field}}List;`,
          "if (map['{{field}}'] != null) {",
          indent(common),
          '}',
        ],
        toMap: [
          `List<Map<String, dynamic>${mapOptional}>? {{field}}List;`,
          'if (input.{{field}} != null) {',
          indent(common2),
          '}',
        ],
      };
      isObjectList = true;
    }
    return {
      result: typeName,
      mapper,
      nullMapper,
      isObjectList,
    };
  }

  override ObjectTypeDefinition(
    node: ObjectTypeDefinitionNode,
    key: number | string,
    parent: any
  ): string {
    const originalInputNode = parent[key] as ObjectTypeDefinitionNode;
    const inputName = node.name;
    let descriptions = node.description
      ? this.buildDartDocs(node.description as any as string)
      : [];

    const maps = [];
    const fields = (node.fields as any).map((it) => it.result);
    let additionalMappers: Array<string> = [];
    for (const field of node.fields) {
      let f = field as any;
      let mappings = f.nullMapper || f.mapper;
      if (mappings) {
        additionalMappers = mappings.map((it) => indent(it, 2));
      }
    }
    const result = [
      ...descriptions,
      `class ${inputName}Mapper {`,
      indent(`${inputName} fromMap(Map<String, dynamic> map) {`),
      ...additionalMappers,
      indent(`return ${inputName}(`, 2),
      ...fields.map((it) => indent(it, 3)),
      indent(`);`, 2),
      indent('}'),
      '}',
    ].join('\n');
    return result;
  }

  override FieldDefinition(
    node: FieldDefinitionNode,
    key?: number | string,
    parent?: any
  ): any {
    const originalFieldNode = parent[key] as FieldDefinitionNode;
    let result = '';
    const name: string = node.name as any as string;
    if (originalFieldNode.type.kind === Kind.LIST_TYPE) {
      result = `${name}: ${name}List,`;
    } else {
      result = `${name}: map['${name}'],`;
    }
    const type = node.type as any;
    let mapper: Array<string>;
    if (type.mapper) {
      mapper = type.mapper.fromMap.map((it) =>
        it.replace(/\{\{field\}\}/g, name)
      );
    }
    let nullMapper: Array<string>;
    if (type.nullMapper) {
      nullMapper = type.nullMapper.fromMap.map((it) =>
        it.replace(/\{\{field\}\}/g, name)
      );
    }
    return {
      result,
      mapper,
      nullMapper,
    };
  }

  override InputObjectTypeDefinition(
    node: InputObjectTypeDefinitionNode,
    key?: number | string,
    parent?: any
  ): string {
    const inputName = node.name;
    let descriptions = node.description
      ? this.buildDartDocs(node.description as any as string)
      : [];

    const maps = [];
    const fields = (node.fields as any).map((it) => it.result);
    let additionalMappers: Array<string> = [];
    for (const field of node.fields) {
      let f = field as any;
      let mappings = f.nullMapper || f.mapper;
      if (mappings) {
        additionalMappers = additionalMappers.concat(mappings.map((it) => indent(it, 2)));
      }
    }

    const result = [
      ...descriptions,
      `class ${inputName}Mapper {`,
      indent(`Map<String, dynamic> toMap(${inputName} input) {`),
      ...additionalMappers,
      indent(`return <String, dynamic>{`, 2),
      ...fields.map((it) => indent(it, 3)),
      indent(`};`, 2),
      indent('}'),
      '}',
    ].join('\n');
    return result;
  }

  private buildDartDocs(description: string): Array<string> {
    let descriptions: Array<string> = [];
    descriptions = description.split('\n').map((it) => `/// ${it}`);
    return descriptions;
  }

  override InputValueDefinition(
    node: InputValueDefinitionNode,
    key?: number | string,
    parent?: any
  ): any {
    const originalFieldNode = parent[key] as InputValueDefinitionNode;
    const name: string = node.name as any as string;
    const type = node.type as any;
    let result;
    if (type.isObject) {
      result = `'${name}': ${name},`;
    } else if (type.isObjectList) {
      result = `'${name}': ${name}List,`;
    } else {
      result = `'${name}': input.${name},`;
    }
    let mapper: Array<string>;
    if (type.mapper) {
      mapper = type.mapper.toMap.map((it) =>
        it.replace(/\{\{field\}\}/g, name)
      );
    }
    let nullMapper: Array<string>;
    if (type.nullMapper) {
      nullMapper = type.nullMapper.toMap.map((it) =>
        it.replace(/\{\{field\}\}/g, name)
      );
    }
    return {
      result,
      mapper,
      nullMapper,
      mapperStatements: type.mapperStatements,
    };
  }

  override EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumName = node.name as any as string;
    let descriptions = node.description
      ? this.buildDartDocs(node.description as any as string)
      : [];
    const enumValues = (node.values as Array<EnumValueDefinitionNode>)
      .map((it) => (it.name as any as string).toLowerCase())
      .map((it) => indent(it) + ',');
    const result = [
      ...descriptions,
      `enum ${enumName} {`,
      ...enumValues,
      '}',
    ].join('\n');
    return result;
  }

  private getDartType(graphqlType: string): string {
    switch (graphqlType) {
      case 'Int':
        return 'int';
      case 'String':
        return 'String';
      case 'Float':
        return 'double';
      case 'Boolean':
        return 'bool';
      case 'Date':
        return 'DateTime';
      case 'DateTime':
        return 'DateTime';
      default:
        return graphqlType;
    }
  }

  private isDartPrimitive(type: string): boolean {
    const finalType = type.replace('?', '');
    const isPrimitive = ['int', 'bool', 'String', 'double', 'num'].includes(
      finalType
    );
    return isPrimitive;
  }
}
