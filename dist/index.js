"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_ast_1 = require("@graphql-codegen/schema-ast");
const graphql_1 = require("graphql");
const dart_mappers_visitor_1 = require("./dart-mappers-visitor");
const dart_model_visitor_1 = require("./dart-model-visitor");
const plugin = (schema, documents, config) => __awaiter(void 0, void 0, void 0, function* () {
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
});
module.exports = {
    plugin
};
