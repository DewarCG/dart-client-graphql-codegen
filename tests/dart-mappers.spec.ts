import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index';

describe('Dart client', () => {
  it('Should map the "name" field', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type MyType {
        name: String
      }
    `);
    const result = await plugin(
      schema,
      [],
      { mappers: true },
      { outputFile: '' }
    );

    expect(result.content.trim()).toBeSimilarStringTo(`
      class MyTypeMapper {
        MyType fromMap(Map<String, dynamic> map) {
          return MyType(
            name: map['name'],
          );
        }
      }`);
  });
  it('Should add nullable list mapping', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type AnotherType {
        name: String
      }
      type MyType {
        anotherTypes: [AnotherType]
      }
    `);
    const result = await plugin(
      schema,
      [],
      { mappers: true },
      { outputFile: '' }
    );

    expect(result.content.trim()).toBeSimilarStringTo(`
      class AnotherTypeMapper {
        AnotherType fromMap(Map<String, dynamic> map) {
          return AnotherType(
            name: map['name'],
          );
        }
      }
      class MyTypeMapper {
        MyType fromMap(Map<String, dynamic> map) {
          List<AnotherType?>? anotherTypesList;
          if (map['anotherTypes'] != null) {
            anotherTypesList = List<AnotherType?>.of(map['anotherTypes']).map((it) => AnotherTypeMapper().fromMap(it)).toList();
          }
          return MyType(
            anotherTypes: anotherTypesList,
          );
        }
      }`);
  });

  it('Should add input mapper', async () => {
    const schema = buildSchema(/* GraphQL */ `
      input MyInput {
        name: String
      }
    `);
    const result = await plugin(
      schema,
      [],
      { mappers: true },
      { outputFile: '' }
    );

    expect(result.content.trim()).toBeSimilarStringTo(`
      class MyInputMapper {
        Map<String, dynamic> toMap(MyInput input) {
          return <String, dynamic>{
            'name': input.name,
          };
        }
      }
      `);
  });
  it('Should add nullable list mapping', async () => {
    const schema = buildSchema(/* GraphQL */ `
      input MyInput {
        name: String
      }
      input AnotherInput {
        myInput: MyInput
      }
    `);
    const result = await plugin(
      schema,
      [],
      { mappers: true },
      { outputFile: '' }
    );

    expect(result.content.trim()).toBeSimilarStringTo(`
      class MyInputMapper {
        Map<String, dynamic> toMap(MyInput input) {
          return <String, dynamic>{
            'name': input.name,
          };
        }
      }
      class AnotherInputMapper {
        Map<String, dynamic> toMap(AnotherInput input) {
          Map<String, dynamic>? myInput;
          if (input.myInput != null) {
            myInput = MyInputMapper().toMap(input.myInput);
          }
          return <String, dynamic>{
            'myInput': myInput,
          };
        }
      }
      `);
  });
  it('Should add list mapping', async () => {
    const schema = buildSchema(/* GraphQL */ `
      input MyInput {
        ids: [String]
      }
    `);
    const result = await plugin(
      schema,
      [],
      { mappers: true },
      { outputFile: '' }
    );

    expect(result.content.trim()).toBeSimilarStringTo(`
      class MyInputMapper {
        Map<String, dynamic> toMap(MyInput input) {
          return <String, dynamic>{
            'ids': input.ids,
          };
        }
      }
      `);
  });
});

it('Should add list mapping', async () => {
  const schema = buildSchema(/* GraphQL */ `
    input MyInput {
      id: Int
    }
    input AnotherInput {
      myInputs: [MyInput]
      otherInputs: [MyInput]!
    }
  `);
  const result = await plugin(
    schema,
    [],
    { mappers: true },
    { outputFile: '' }
  );

  expect(result.content.trim()).toBeSimilarStringTo(`
    class MyInputMapper {
      Map<String, dynamic> toMap(MyInput input) {
        return <String, dynamic>{
          'id': input.id,
        };
      }
    }
    class AnotherInputMapper {
      Map<String, dynamic> toMap(AnotherInput input) {
        List<Map<String, dynamic>?>? myInputsList;
        if (input.myInputs != null) {
          myInputsList = input.myInputs.map((it) => MyInputMapper().toMap(it)).toList();
        }
        final otherInputsList = input.otherInputs.map((it) => MyInputMapper().toMap(it)).toList();
        return <String, dynamic>{
          'myInputs': myInputsList,
          'otherInputs': otherInputsList,
        };
      }
    }
    `);
})
