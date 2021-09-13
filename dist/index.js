"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = void 0;
const schema_ast_1 = require("@graphql-codegen/schema-ast");
const graphql_1 = require("graphql");
const dart_mappers_visitor_1 = require("./dart-mappers-visitor");
const dart_model_visitor_1 = require("./dart-model-visitor");
const plugin = (schema, documents, config) => {
    const { schema: _schema, ast } = (0, schema_ast_1.transformSchemaAST)(schema, config);
    const visitor = new dart_model_visitor_1.DartModelVisitor(_schema, config);
    const visitorResult = (0, graphql_1.visit)(ast, { leave: visitor });
    let mappersDefinitions = [];
    const dartMappersVisitor = new dart_mappers_visitor_1.DartMappersVisitor(_schema, config);
    const dartMapperResult = (0, graphql_1.visit)(ast, { leave: dartMappersVisitor });
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
exports.plugin = plugin;
