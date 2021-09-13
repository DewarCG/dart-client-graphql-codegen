"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DartMappersVisitor = void 0;
const visitor_plugin_common_1 = require("@graphql-codegen/visitor-plugin-common");
const graphql_1 = require("graphql");
class DartMappersVisitor extends visitor_plugin_common_1.BaseTypesVisitor {
    constructor(schema, pluginConfig, additionalConfig = {}) {
        super(schema, pluginConfig, {});
    }
    NonNullType(node) {
        const type = node.type;
        let result = type.result;
        result = result.replace('?', '');
        result = this.getDartType(result);
        return {
            result,
            mapper: type.mapper,
            isObjectList: type.isObjectList,
        };
    }
    NamedType(node) {
        let type = this.getDartType(node.name);
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
                    (0, visitor_plugin_common_1.indent)(`{{field}} = ${type}Mapper().toMap(input.{{field}});`),
                    `}`,
                ],
                fromMap: [
                    `${type}? {{field}};`,
                    `if (map['{{field}}'] != null) {`,
                    (0, visitor_plugin_common_1.indent)(`{{field}} = ${type}Mapper().fromMap(map['{{field}}']);`),
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
    ListType(node, key, parent) {
        const type = node.type;
        const typeName = type.result;
        let mapper;
        let nullMapper;
        let isObjectList = false;
        if (!this.isDartPrimitive(typeName)) {
            const mapperSuffixName = typeName.replace('?', '');
            const common = `{{field}}List = List<${typeName}>.of(map['{{field}}']).map((it) => ${mapperSuffixName}Mapper().fromMap(it)).toList();`;
            const common2 = `{{field}}List = input.{{field}}.map((it) => ${mapperSuffixName}Mapper().toMap(it)).toList();`;
            const mapOptional = typeName.includes('?') ? '?' : '';
            mapper = {
                fromMap: [`final ${common}`],
                toMap: [`final ${common2}`],
            };
            nullMapper = {
                fromMap: [
                    `List<${typeName}>? {{field}}List;`,
                    "if (map['{{field}}'] != null) {",
                    (0, visitor_plugin_common_1.indent)(common),
                    '}',
                ],
                toMap: [
                    `List<Map<String, dynamic>${mapOptional}>? {{field}}List;`,
                    'if (input.{{field}} != null) {',
                    (0, visitor_plugin_common_1.indent)(common2),
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
    ObjectTypeDefinition(node, key, parent) {
        const originalInputNode = parent[key];
        const inputName = node.name;
        let descriptions = node.description
            ? this.buildDartDocs(node.description)
            : [];
        const maps = [];
        const fields = node.fields.map((it) => it.result);
        let additionalMappers = [];
        for (const field of node.fields) {
            let f = field;
            let mappings = f.nullMapper || f.mapper;
            if (mappings) {
                additionalMappers = mappings.map((it) => (0, visitor_plugin_common_1.indent)(it, 2));
            }
        }
        const result = [
            ...descriptions,
            `class ${inputName}Mapper {`,
            (0, visitor_plugin_common_1.indent)(`${inputName} fromMap(Map<String, dynamic> map) {`),
            ...additionalMappers,
            (0, visitor_plugin_common_1.indent)(`return ${inputName}(`, 2),
            ...fields.map((it) => (0, visitor_plugin_common_1.indent)(it, 3)),
            (0, visitor_plugin_common_1.indent)(`);`, 2),
            (0, visitor_plugin_common_1.indent)('}'),
            '}',
        ].join('\n');
        return result;
    }
    FieldDefinition(node, key, parent) {
        const originalFieldNode = parent[key];
        let result = '';
        const name = node.name;
        if (originalFieldNode.type.kind === graphql_1.Kind.LIST_TYPE) {
            result = `${name}: ${name}List,`;
        }
        else {
            result = `${name}: map['${name}'],`;
        }
        const type = node.type;
        let mapper;
        if (type.mapper) {
            mapper = type.mapper.fromMap.map((it) => it.replace(/\{\{field\}\}/g, name));
        }
        let nullMapper;
        if (type.nullMapper) {
            nullMapper = type.nullMapper.fromMap.map((it) => it.replace(/\{\{field\}\}/g, name));
        }
        return {
            result,
            mapper,
            nullMapper,
        };
    }
    InputObjectTypeDefinition(node, key, parent) {
        const inputName = node.name;
        let descriptions = node.description
            ? this.buildDartDocs(node.description)
            : [];
        const maps = [];
        const fields = node.fields.map((it) => it.result);
        let additionalMappers = [];
        for (const field of node.fields) {
            let f = field;
            let mappings = f.nullMapper || f.mapper;
            if (mappings) {
                additionalMappers = additionalMappers.concat(mappings.map((it) => (0, visitor_plugin_common_1.indent)(it, 2)));
            }
        }
        const result = [
            ...descriptions,
            `class ${inputName}Mapper {`,
            (0, visitor_plugin_common_1.indent)(`Map<String, dynamic> toMap(${inputName} input) {`),
            ...additionalMappers,
            (0, visitor_plugin_common_1.indent)(`return <String, dynamic>{`, 2),
            ...fields.map((it) => (0, visitor_plugin_common_1.indent)(it, 3)),
            (0, visitor_plugin_common_1.indent)(`};`, 2),
            (0, visitor_plugin_common_1.indent)('}'),
            '}',
        ].join('\n');
        return result;
    }
    buildDartDocs(description) {
        let descriptions = [];
        descriptions = description.split('\n').map((it) => `/// ${it}`);
        return descriptions;
    }
    InputValueDefinition(node, key, parent) {
        const originalFieldNode = parent[key];
        const name = node.name;
        const type = node.type;
        let result;
        if (type.isObject) {
            result = `'${name}': ${name},`;
        }
        else if (type.isObjectList) {
            result = `'${name}': ${name}List,`;
        }
        else {
            result = `'${name}': input.${name},`;
        }
        let mapper;
        if (type.mapper) {
            mapper = type.mapper.toMap.map((it) => it.replace(/\{\{field\}\}/g, name));
        }
        let nullMapper;
        if (type.nullMapper) {
            nullMapper = type.nullMapper.toMap.map((it) => it.replace(/\{\{field\}\}/g, name));
        }
        return {
            result,
            mapper,
            nullMapper,
            mapperStatements: type.mapperStatements,
        };
    }
    EnumTypeDefinition(node) {
        const enumName = node.name;
        let descriptions = node.description
            ? this.buildDartDocs(node.description)
            : [];
        const enumValues = node.values
            .map((it) => it.name.toLowerCase())
            .map((it) => (0, visitor_plugin_common_1.indent)(it) + ',');
        const result = [
            ...descriptions,
            `enum ${enumName} {`,
            ...enumValues,
            '}',
        ].join('\n');
        return result;
    }
    getDartType(graphqlType) {
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
    isDartPrimitive(type) {
        const finalType = type.replace('?', '');
        const isPrimitive = ['int', 'bool', 'String', 'double', 'num'].includes(finalType);
        return isPrimitive;
    }
}
exports.DartMappersVisitor = DartMappersVisitor;
