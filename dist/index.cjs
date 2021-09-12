"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = void 0;
var schema_ast_1 = require("@graphql-codegen/schema-ast");
var graphql_1 = require("graphql");
var dart_mappers_visitor_1 = require("./dart-mappers-visitor");
var dart_model_visitor_1 = require("./dart-model-visitor");
var plugin = function (schema, documents, config) {
    var _a = (0, schema_ast_1.transformSchemaAST)(schema, config), _schema = _a.schema, ast = _a.ast;
    var visitor = new dart_model_visitor_1.DartModelVisitor(_schema, config);
    var visitorResult = (0, graphql_1.visit)(ast, { leave: visitor });
    var mappersDefinitions = [];
    var dartMappersVisitor = new dart_mappers_visitor_1.DartMappersVisitor(_schema, config);
    var dartMapperResult = (0, graphql_1.visit)(ast, { leave: dartMappersVisitor });
    mappersDefinitions = dartMapperResult.definitions;
    if (config.mappers) {
        visitorResult.definitions = []; // TODO
    }
    var result = {
        content: __spreadArray(__spreadArray([], visitorResult.definitions, true), mappersDefinitions, true).filter(Boolean)
            .join('\n'),
    };
    return result;
};
exports.plugin = plugin;
//# sourceMappingURL=index.js.map