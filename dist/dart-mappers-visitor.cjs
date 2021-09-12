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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DartMappersVisitor = void 0;
var visitor_plugin_common_1 = require("@graphql-codegen/visitor-plugin-common");
var auto_bind_1 = __importDefault(require("auto-bind"));
var graphql_1 = require("graphql");
var DartMappersVisitor = /** @class */ (function (_super) {
    __extends(DartMappersVisitor, _super);
    function DartMappersVisitor(schema, pluginConfig, additionalConfig) {
        if (additionalConfig === void 0) { additionalConfig = {}; }
        var _this = _super.call(this, schema, pluginConfig, {}) || this;
        (0, auto_bind_1.default)(_this);
        return _this;
    }
    DartMappersVisitor.prototype.NonNullType = function (node) {
        var type = node.type;
        var result = type.result;
        result = result.replace('?', '');
        result = this.getDartType(result);
        return {
            result: result,
            mapper: type.mapper,
            isObjectList: type.isObjectList,
        };
    };
    DartMappersVisitor.prototype.NamedType = function (node) {
        var type = this.getDartType(node.name);
        var mapper = undefined;
        var nullMapper = undefined;
        var isObject = false;
        if (!this.isDartPrimitive(type)) {
            mapper = {
                fromMap: ["final {{field}} = " + type + "Mapper().fromMap({{parameter}});"],
                toMap: ["final {{field}} = " + type + "Mapper().toMap({{parameter}});"],
            };
            nullMapper = {
                toMap: [
                    "Map<String, dynamic>? {{field}};",
                    "if (input.{{field}} != null) {",
                    (0, visitor_plugin_common_1.indent)("{{field}} = " + type + "Mapper().toMap(input.{{field}});"),
                    "}",
                ],
                fromMap: [
                    type + "? {{field}};",
                    "if (map['{{field}}'] != null) {",
                    (0, visitor_plugin_common_1.indent)("{{field}} = " + type + "Mapper().fromMap(map['{{field}}']);"),
                    "}",
                ],
            };
            isObject = true;
        }
        type = type + '?';
        return {
            result: type,
            mapper: mapper,
            nullMapper: nullMapper,
            isObject: isObject,
        };
    };
    DartMappersVisitor.prototype.ListType = function (node, key, parent) {
        var type = node.type;
        var typeName = type.result;
        var mapper;
        var nullMapper;
        var isObjectList = false;
        if (!this.isDartPrimitive(typeName)) {
            var mapperSuffixName = typeName.replace('?', '');
            var common = "{{field}}List = List<" + typeName + ">.of(map['{{field}}']).map((it) => " + mapperSuffixName + "Mapper().fromMap(it)).toList();";
            var common2 = "{{field}}List = input.{{field}}.map((it) => " + mapperSuffixName + "Mapper().toMap(it)).toList();";
            var mapOptional = typeName.includes('?') ? '?' : '';
            mapper = {
                fromMap: ["final " + common],
                toMap: ["final " + common2],
            };
            nullMapper = {
                fromMap: [
                    "List<" + typeName + ">? {{field}}List;",
                    "if (map['{{field}}'] != null) {",
                    (0, visitor_plugin_common_1.indent)(common),
                    '}',
                ],
                toMap: [
                    "List<Map<String, dynamic>" + mapOptional + ">? {{field}}List;",
                    'if (input.{{field}} != null) {',
                    (0, visitor_plugin_common_1.indent)(common2),
                    '}',
                ],
            };
            isObjectList = true;
        }
        return {
            result: typeName,
            mapper: mapper,
            nullMapper: nullMapper,
            isObjectList: isObjectList,
        };
    };
    DartMappersVisitor.prototype.ObjectTypeDefinition = function (node, key, parent) {
        var originalInputNode = parent[key];
        var inputName = node.name;
        var descriptions = node.description
            ? this.buildDartDocs(node.description)
            : [];
        var maps = [];
        var fields = node.fields.map(function (it) { return it.result; });
        var additionalMappers = [];
        for (var _i = 0, _a = node.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            var f = field;
            var mappings = f.nullMapper || f.mapper;
            if (mappings) {
                additionalMappers = mappings.map(function (it) { return (0, visitor_plugin_common_1.indent)(it, 2); });
            }
        }
        var result = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], descriptions, true), [
            "class " + inputName + "Mapper {",
            (0, visitor_plugin_common_1.indent)(inputName + " fromMap(Map<String, dynamic> map) {")
        ], false), additionalMappers, true), [
            (0, visitor_plugin_common_1.indent)("return " + inputName + "(", 2)
        ], false), fields.map(function (it) { return (0, visitor_plugin_common_1.indent)(it, 3); }), true), [
            (0, visitor_plugin_common_1.indent)(");", 2),
            (0, visitor_plugin_common_1.indent)('}'),
            '}',
        ], false).join('\n');
        return result;
    };
    DartMappersVisitor.prototype.FieldDefinition = function (node, key, parent) {
        var originalFieldNode = parent[key];
        var result = '';
        var name = node.name;
        if (originalFieldNode.type.kind === graphql_1.Kind.LIST_TYPE) {
            result = name + ": " + name + "List,";
        }
        else {
            result = name + ": map['" + name + "'],";
        }
        var type = node.type;
        var mapper;
        if (type.mapper) {
            mapper = type.mapper.fromMap.map(function (it) {
                return it.replace(/\{\{field\}\}/g, name);
            });
        }
        var nullMapper;
        if (type.nullMapper) {
            nullMapper = type.nullMapper.fromMap.map(function (it) {
                return it.replace(/\{\{field\}\}/g, name);
            });
        }
        return {
            result: result,
            mapper: mapper,
            nullMapper: nullMapper,
        };
    };
    DartMappersVisitor.prototype.InputObjectTypeDefinition = function (node, key, parent) {
        var inputName = node.name;
        var descriptions = node.description
            ? this.buildDartDocs(node.description)
            : [];
        var maps = [];
        var fields = node.fields.map(function (it) { return it.result; });
        var additionalMappers = [];
        for (var _i = 0, _a = node.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            var f = field;
            var mappings = f.nullMapper || f.mapper;
            if (mappings) {
                additionalMappers = additionalMappers.concat(mappings.map(function (it) { return (0, visitor_plugin_common_1.indent)(it, 2); }));
            }
        }
        var result = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], descriptions, true), [
            "class " + inputName + "Mapper {",
            (0, visitor_plugin_common_1.indent)("Map<String, dynamic> toMap(" + inputName + " input) {")
        ], false), additionalMappers, true), [
            (0, visitor_plugin_common_1.indent)("return <String, dynamic>{", 2)
        ], false), fields.map(function (it) { return (0, visitor_plugin_common_1.indent)(it, 3); }), true), [
            (0, visitor_plugin_common_1.indent)("};", 2),
            (0, visitor_plugin_common_1.indent)('}'),
            '}',
        ], false).join('\n');
        return result;
    };
    DartMappersVisitor.prototype.buildDartDocs = function (description) {
        var descriptions = [];
        descriptions = description.split('\n').map(function (it) { return "/// " + it; });
        return descriptions;
    };
    DartMappersVisitor.prototype.InputValueDefinition = function (node, key, parent) {
        var originalFieldNode = parent[key];
        var name = node.name;
        var type = node.type;
        var result;
        if (type.isObject) {
            result = "'" + name + "': " + name + ",";
        }
        else if (type.isObjectList) {
            result = "'" + name + "': " + name + "List,";
        }
        else {
            result = "'" + name + "': input." + name + ",";
        }
        var mapper;
        if (type.mapper) {
            mapper = type.mapper.toMap.map(function (it) {
                return it.replace(/\{\{field\}\}/g, name);
            });
        }
        var nullMapper;
        if (type.nullMapper) {
            nullMapper = type.nullMapper.toMap.map(function (it) {
                return it.replace(/\{\{field\}\}/g, name);
            });
        }
        return {
            result: result,
            mapper: mapper,
            nullMapper: nullMapper,
            mapperStatements: type.mapperStatements,
        };
    };
    DartMappersVisitor.prototype.EnumTypeDefinition = function (node) {
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
    DartMappersVisitor.prototype.getDartType = function (graphqlType) {
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
    DartMappersVisitor.prototype.isDartPrimitive = function (type) {
        var finalType = type.replace('?', '');
        var isPrimitive = ['int', 'bool', 'String', 'double', 'num'].includes(finalType);
        return isPrimitive;
    };
    return DartMappersVisitor;
}(visitor_plugin_common_1.BaseTypesVisitor));
exports.DartMappersVisitor = DartMappersVisitor;
//# sourceMappingURL=dart-mappers-visitor.js.map