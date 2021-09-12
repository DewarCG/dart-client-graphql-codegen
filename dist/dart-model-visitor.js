"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.DartModelVisitor = void 0;
var visitor_plugin_common_1 = require("@graphql-codegen/visitor-plugin-common");
var auto_bind_1 = __importDefault(require("auto-bind"));
var graphql_1 = require("graphql");
var DartModelVisitor = /** @class */ (function (_super) {
    __extends(DartModelVisitor, _super);
    function DartModelVisitor(schema, pluginConfig, additionalConfig) {
        if (additionalConfig === void 0) { additionalConfig = {}; }
        var _this = _super.call(this, schema, pluginConfig, {}) || this;
        (0, auto_bind_1["default"])(_this);
        return _this;
    }
    DartModelVisitor.prototype.NonNullType = function (node) {
        var result = node.type;
        result = result.replace('?', '');
        result = this.getDartType(result);
        return result;
    };
    DartModelVisitor.prototype.NamedType = function (node) {
        var result = this.getDartType(node.name);
        return result + '?';
    };
    DartModelVisitor.prototype.ListType = function (node) {
        var result = "List<" + node.type + ">?";
        return result;
    };
    DartModelVisitor.prototype.FieldDefinition = function (node, key, parent) {
        var typeString = node.type;
        var originalFieldNode = parent[key];
        var addOptionalSign = originalFieldNode.type.kind !== graphql_1.Kind.NON_NULL_TYPE;
        var comment = this.getFieldComment(node);
        var type = this.config.declarationKind.type;
        var result = (0, visitor_plugin_common_1.indent)(typeString + " " + node.name + ";");
        return result;
    };
    DartModelVisitor.prototype.InputObjectTypeDefinition = function (node, key, parent) {
        var originalInputNode = parent[key];
        var inputName = node.name;
        var fields = node.fields.join('\n');
        var constructorFields = [];
        for (var _i = 0, _a = originalInputNode.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            var fieldWithThis = "this." + field.name.value;
            var finalConstructorField = '';
            if (field.type.kind === graphql_1.Kind.NON_NULL_TYPE) {
                finalConstructorField = "required " + fieldWithThis;
            }
            else {
                finalConstructorField = fieldWithThis;
            }
            finalConstructorField += ',';
            constructorFields.push((0, visitor_plugin_common_1.indent)(finalConstructorField, 2));
        }
        var descriptions = node.description
            ? this.buildDartDocs(node.description)
            : [];
        var result = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], descriptions, true), [
            "class " + inputName + " {",
            (0, visitor_plugin_common_1.indent)(inputName + "({")
        ], false), constructorFields, true), [
            (0, visitor_plugin_common_1.indent)('});'),
            fields,
            '}',
        ], false).join('\n');
        return result;
    };
    DartModelVisitor.prototype.buildDartDocs = function (description) {
        var descriptions = [];
        descriptions = description.split('\n').map(function (it) { return "/// " + it; });
        return descriptions;
    };
    DartModelVisitor.prototype.InputValueDefinition = function (node, key, parent) {
        var descriptions = node.description
            ? this.buildDartDocs(node.description)
            : [];
        var type = node.type;
        var result = __spreadArray(__spreadArray([], descriptions, true), [(0, visitor_plugin_common_1.indent)(type + " " + node.name + ";")], false).join('\n');
        return result;
    };
    DartModelVisitor.prototype.ObjectTypeDefinition = function (node, key, parent) {
        var originalInputNode = parent[key];
        var inputName = node.name;
        var fields = node.fields.join('\n');
        var constructorFields = [];
        for (var _i = 0, _a = originalInputNode.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            var fieldWithThis = "this." + field.name.value;
            var finalConstructorField = '';
            if (field.type.kind === graphql_1.Kind.NON_NULL_TYPE) {
                finalConstructorField = "required " + fieldWithThis;
            }
            else {
                finalConstructorField = fieldWithThis;
            }
            finalConstructorField += ',';
            constructorFields.push((0, visitor_plugin_common_1.indent)(finalConstructorField, 2));
        }
        var descriptions = node.description
            ? this.buildDartDocs(node.description)
            : [];
        var result = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], descriptions, true), [
            "class " + inputName + " {",
            (0, visitor_plugin_common_1.indent)(inputName + "({")
        ], false), constructorFields, true), [
            (0, visitor_plugin_common_1.indent)('});'),
            fields,
            '}',
        ], false).join('\n');
        return result;
    };
    DartModelVisitor.prototype.EnumTypeDefinition = function (node) {
        var enumName = node.name;
        var descriptions = node.description
            ? this.buildDartDocs(node.description)
            : [];
        var enumValues = node.values
            .map(function (it) { return it.name.toLowerCase(); })
            .map(function (it) { return (0, visitor_plugin_common_1.indent)(it) + ','; });
        var result = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], descriptions, true), [
            "enum " + enumName + " {"
        ], false), enumValues, true), [
            '}',
        ], false).join('\n');
        return result;
    };
    DartModelVisitor.prototype.getDartType = function (graphqlType) {
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
    };
    return DartModelVisitor;
}(visitor_plugin_common_1.BaseTypesVisitor));
exports.DartModelVisitor = DartModelVisitor;
//# sourceMappingURL=dart-model-visitor.js.map