import { BaseTypesVisitor, indent, } from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { Kind, } from 'graphql';
export class DartModelVisitor extends BaseTypesVisitor {
    constructor(schema, pluginConfig, additionalConfig = {}) {
        super(schema, pluginConfig, {});
        autoBind(this);
    }
    NonNullType(node) {
        let result = node.type;
        result = result.replace('?', '');
        result = this.getDartType(result);
        return result;
    }
    NamedType(node) {
        let result = this.getDartType(node.name);
        return result + '?';
    }
    ListType(node) {
        const result = `List<${node.type}>?`;
        return result;
    }
    FieldDefinition(node, key, parent) {
        const typeString = node.type;
        const originalFieldNode = parent[key];
        const addOptionalSign = originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
        const comment = this.getFieldComment(node);
        const { type } = this.config.declarationKind;
        const result = indent(`${typeString} ${node.name};`);
        return result;
    }
    InputObjectTypeDefinition(node, key, parent) {
        const originalInputNode = parent[key];
        const inputName = node.name;
        const fields = node.fields.join('\n');
        const constructorFields = [];
        for (const field of originalInputNode.fields) {
            let fieldWithThis = `this.${field.name.value}`;
            let finalConstructorField = '';
            if (field.type.kind === Kind.NON_NULL_TYPE) {
                finalConstructorField = `required ${fieldWithThis}`;
            }
            else {
                finalConstructorField = fieldWithThis;
            }
            finalConstructorField += ',';
            constructorFields.push(indent(finalConstructorField, 2));
        }
        let descriptions = node.description
            ? this.buildDartDocs(node.description)
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
    buildDartDocs(description) {
        let descriptions = [];
        descriptions = description.split('\n').map((it) => `/// ${it}`);
        return descriptions;
    }
    InputValueDefinition(node, key, parent) {
        let descriptions = node.description
            ? this.buildDartDocs(node.description)
            : [];
        let type = node.type;
        const result = [...descriptions, indent(`${type} ${node.name};`)].join('\n');
        return result;
    }
    ObjectTypeDefinition(node, key, parent) {
        const originalInputNode = parent[key];
        const inputName = node.name;
        const fields = node.fields.join('\n');
        const constructorFields = [];
        for (const field of originalInputNode.fields) {
            let fieldWithThis = `this.${field.name.value}`;
            let finalConstructorField = '';
            if (field.type.kind === Kind.NON_NULL_TYPE) {
                finalConstructorField = `required ${fieldWithThis}`;
            }
            else {
                finalConstructorField = fieldWithThis;
            }
            finalConstructorField += ',';
            constructorFields.push(indent(finalConstructorField, 2));
        }
        let descriptions = node.description
            ? this.buildDartDocs(node.description)
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
    EnumTypeDefinition(node) {
        const enumName = node.name;
        let descriptions = node.description
            ? this.buildDartDocs(node.description)
            : [];
        const enumValues = node.values
            .map((it) => it.name.toLowerCase())
            .map((it) => indent(it) + ',');
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
}
//# sourceMappingURL=dart-model-visitor.js.map