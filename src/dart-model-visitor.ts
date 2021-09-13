import {
  BaseTypesVisitor,
  indent,
  ParsedTypesConfig,
} from '@graphql-codegen/visitor-plugin-common';
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

export class DartModelVisitor<
  TRawConfig extends DartPluginConfig = DartPluginConfig,
  TParsedConfig extends DartPluginParsedConfig = DartPluginParsedConfig
> extends BaseTypesVisitor<TRawConfig, TParsedConfig> {
  constructor(
    schema: GraphQLSchema,
    pluginConfig: TRawConfig,
    additionalConfig: Partial<TParsedConfig> = {}
  ) {
    super(schema, pluginConfig, {} as TParsedConfig);
  }

  override NonNullType(node: NonNullTypeNode): string {
    let result: string = node.type as any as string;
    result = result.replace('?', '');
    result = this.getDartType(result);
    return result;
  }

  override NamedType(node: NamedTypeNode): string {
    let result = this.getDartType(node.name as any as string);
    return result + '?';
  }

  override ListType(node: ListTypeNode): string {
    const result = `List<${node.type}>?`;
    return result;
  }

  override FieldDefinition(
    node: FieldDefinitionNode,
    key?: number | string,
    parent?: any
  ): string {
    const typeString = node.type as any as string;
    const originalFieldNode = parent[key] as FieldDefinitionNode;
    const addOptionalSign = originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
    const comment = this.getFieldComment(node);
    const { type } = this.config.declarationKind;

    const result = indent(`${typeString} ${node.name};`);
    return result;
  }

  override InputObjectTypeDefinition(
    node: InputObjectTypeDefinitionNode,
    key?: number | string,
    parent?: any
  ): string {
    const originalInputNode = parent[key] as InputObjectTypeDefinitionNode;
    const inputName = node.name;
    const fields = node.fields.join('\n');
    const constructorFields = [];
    for (const field of originalInputNode.fields) {
      let fieldWithThis = `this.${field.name.value}`;
      let finalConstructorField = '';
      if (field.type.kind === Kind.NON_NULL_TYPE) {
        finalConstructorField = `required ${fieldWithThis}`;
      } else {
        finalConstructorField = fieldWithThis;
      }
      finalConstructorField += ',';
      constructorFields.push(indent(finalConstructorField, 2));
    }
    let descriptions = node.description
      ? this.buildDartDocs(node.description as any as string)
      : [];
    const result = [
      ...descriptions,
      `class ${inputName} {`,
      indent(`${inputName}({`),
      ...constructorFields,
      indent('});'),
      fields,
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
  ): string {
    let descriptions = node.description
      ? this.buildDartDocs(node.description as any as string)
      : [];

    let type: string = node.type as any;
    const result = [...descriptions, indent(`${type} ${node.name};`)].join(
      '\n'
    );
    return result;
  }

  override ObjectTypeDefinition(
    node: ObjectTypeDefinitionNode,
    key: number | string,
    parent: any
  ): string {
    const originalInputNode = parent[key] as ObjectTypeDefinitionNode;
    const inputName = node.name;
    const fields = node.fields.join('\n');
    const constructorFields = [];
    for (const field of originalInputNode.fields) {
      let fieldWithThis = `this.${field.name.value}`;
      let finalConstructorField = '';
      if (field.type.kind === Kind.NON_NULL_TYPE) {
        finalConstructorField = `required ${fieldWithThis}`;
      } else {
        finalConstructorField = fieldWithThis;
      }
      finalConstructorField += ',';
      constructorFields.push(indent(finalConstructorField, 2));
    }
    let descriptions = node.description
      ? this.buildDartDocs(node.description as any as string)
      : [];
    const result = [
      ...descriptions,
      `class ${inputName} {`,
      indent(`${inputName}({`),
      ...constructorFields,
      indent('});'),
      fields,
      '}',
    ].join('\n');
    return result;
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
}
