import "@graphql-codegen/testing";
import { buildSchema } from "graphql";
import { plugin } from "../src/index";

describe("Dart client", () => {
  it("Should add comments", async () => {
    const schema = buildSchema(/* GraphQL */ `
      "MyInput description"
      input MyInput {
        name: String
      }
    `);
    const result = await plugin(schema, [], {}, { outputFile: "" });

    expect(result.content.trim()).toBeSimilarStringTo(`
      /// MyInput description
      class MyInput`);
  });
  it("Should add multiple comments", async () => {
    const schema = buildSchema(/* GraphQL */ `
      """
      MyInput
      description
      """
      input MyInput {
        name: String
      }
    `);
    const result = await plugin(schema, [], {}, { outputFile: "" });

    expect(result.content.trim()).toBeSimilarStringTo(`
      /// MyInput
      /// description
      class MyInput`);
  });
  it("Should add constructor and field", async () => {
    const schema = buildSchema(/* GraphQL */ `
      input MyInput {
        name: String
      }
    `);
    const result = await plugin(schema, [], {}, { outputFile: "" });

    expect(result.content.trim()).toBeSimilarStringTo(`
      class MyInput {
        MyInput({
          this.name,
        });

        String? name;
      }`);
  });
  it('Should add "required" prefix for mandatory fields', async () => {
    const schema = buildSchema(/* GraphQL */ `
      input MyInput {
        name: String!
      }
    `);
    const result = await plugin(schema, [], {}, { outputFile: "" });

    expect(result.content.trim()).toBeSimilarStringTo(`
      class MyInput {
        MyInput({
          required this.name,
        });

        String name;
      }`);
  });
  it("Should add list of fields", async () => {
    const schema = buildSchema(/* GraphQL */ `
      input MyInput {
        ids: [Int]
        descriptions: [String!]!
      }
    `);
    const result = await plugin(schema, [], {}, { outputFile: "" });

    expect(result.content.trim()).toBeSimilarStringTo(`
      class MyInput {
        MyInput({
          this.ids,
          required this.descriptions,
        });

        List<int?>? ids;
        List<String> descriptions;
      }`);
  });
  it("Should work with types", async () => {
    const schema = buildSchema(/* GraphQL */ `
      type MyType {
        id: Int
      }
    `);
    const result = await plugin(schema, [], {}, { outputFile: "" });

    expect(result.content.trim()).toBeSimilarStringTo(`
      class MyType {
        MyType({
          this.id,
        });

        int? id;
      }`);
  });
  it("Should add list of fields to type", async () => {
    const schema = buildSchema(/* GraphQL */ `
      type MyType {
        ids: [Int]
        descriptions: [String!]!
      }
    `);
    const result = await plugin(schema, [], {}, { outputFile: "" });

    expect(result.content.trim()).toBeSimilarStringTo(`
      class MyType {
        MyType({
          this.ids,
          required this.descriptions,
        });

        List<int?>? ids;
        List<String> descriptions;
      }`);
  });
  it("Should work with enums", async () => {
    const schema = buildSchema(/* GraphQL */ `
      enum MyEnum {
        A
        B
        C
      }
    `);
    const result = await plugin(schema, [], {}, { outputFile: "" });

    expect(result.content.trim()).toBeSimilarStringTo(`
      enum MyEnum {
        a,
        b,
        c,
      }`);
  });
});
