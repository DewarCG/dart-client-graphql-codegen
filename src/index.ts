import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { GraphQLSchema, visit } from 'graphql';
import { DartPluginConfig } from './config';
import { DartMappersVisitor } from './dart-mappers-visitor';
import { DartModelVisitor } from './dart-model-visitor';

export const plugin: PluginFunction<
  DartPluginConfig,
  Types.ComplexPluginOutput
> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: DartPluginConfig
) => {
  const { schema: _schema, ast } = transformSchemaAST(schema, config);

  const visitor = new DartModelVisitor(_schema, config);
  const visitorResult = visit(ast, { leave: visitor });

  let mappersDefinitions = [];

  const dartMappersVisitor = new DartMappersVisitor(_schema, config);
  const dartMapperResult = visit(ast, { leave: dartMappersVisitor });
  mappersDefinitions = dartMapperResult.definitions;

  if (config.mappers) {
    visitorResult.definitions = []; // TODO
  }

  const result = {
    content: [...visitorResult.definitions, ...mappersDefinitions]
      .filter(Boolean)
      .join('\n'),
  };
  return result;
};
