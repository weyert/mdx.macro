const { createMacro } = require("babel-plugin-macros");
const mdx = require("@mdx-js/mdx");
const restSpreadSyntax = require("babel-plugin-syntax-object-rest-spread");
const jsxSyntax = require("babel-plugin-syntax-jsx");
const path = require("path");
const fs = require("fs");

module.exports = createMacro(MDX);

function MDX({ references, babel, state }) {
  const { mdx, imports } = references;
  const { types: t } = babel;

  let mdxImports = [];
  mdx.forEach(referencePath => {
    if (referencePath.parentPath.type === "CallExpression") {
      const importStatements = requireRaw({ referencePath, state, babel });
      mdxImports = [...mdxImports, ...importStatements];
    } else {
      throw new Error(
        `This is not supported: \`${referencePath
          .findParent(babel.types.isExpression)
          .getSource()}\`. Please see the raw.macro documentation`
      );
    }
  });

  // Process any imports and add them where `imports` was called from
  imports.forEach(reference => {
    let { ast, code } = babel.transform(
      [`import {MDXTag} from '@mdx-js/tag'`].concat(mdxImports).join("\n"),
      {
        ast: true
      }
    );
    reference.parentPath.replaceWithMultiple(
      ast.program.body.map(impNode => {
        return t.importDeclaration(impNode.specifiers, impNode.source);
      })
    );
  });
}

function requireRaw({ referencePath, state, babel }) {
  const filename = state.file.opts.filename;
  const { types: t } = babel;
  const callExpressionPath = referencePath.parentPath;
  const dirname = path.dirname(filename);
  let rawPath;

  try {
    rawPath = callExpressionPath.get("arguments")[0].evaluate().value;
  } catch (err) {
    // swallow error, print better error below
  }

  if (rawPath === undefined) {
    throw new Error(
      `There was a problem evaluating the value of the argument for the code: ${callExpressionPath.getSource()}. ` +
        `If the value is dynamic, please make sure that its value is statically deterministic.`
    );
  }

  const fullPath = path.resolve(dirname, rawPath);
  const fileContent = fs.readFileSync(fullPath, { encoding: "utf-8" });

  let transformedFunction = mdx.sync(fileContent).replace("export default", "");
  const funcName = callExpressionPath.parent.id.name;

  let mdxImports = [];
  transformedFunction = transformedFunction
    .split("\n")
    .map(line => {
      if (line.includes("import")) {
        mdxImports.push(line);
        return null;
      } else {
        return line;
      }
    })
    .filter(Boolean)
    .join("\n");

  let { ast, code } = babel.transform(
    `const ${funcName} = ${transformedFunction}`,
    {
      plugins: [jsxSyntax, restSpreadSyntax],
      ast: true
    }
  );

  callExpressionPath.replaceWith(
    t.arrowFunctionExpression(
      [
        // build out a function argument that looks like
        // ({ components, ...props })
        t.objectPattern([
          t.objectProperty(
            t.identifier("components"),
            t.identifier("components"),
            false,
            // set shorthand to true, otherwise it generates
            // ({ components: components })
            true
          ),
          // spread in props
          t.restElement(t.identifier("props"))
        ])
      ],
      // :this_is_fine_dog:
      // ensure we grab the last function, in case babel
      // transforms the above code into more than one function
      ast.program.body[ast.program.body.length - 1].declarations[0].init.body
    )
  );

  return mdxImports;
}
