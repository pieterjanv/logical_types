import './node_modules/@monaco-editor/loader/lib/umd/monaco-loader.min.js';

const appUrl = `${location.origin}${location.pathname.replace(/\/$/, '')}`;

/** @type {typeof import('@monaco-editor/loader')['default']} */
const loader = monaco_loader;

loader.config({ paths: {
	vs: `${appUrl}/node_modules/monaco-editor/min/vs`,
} });

// Initialize monaco
const monaco = await loader.init();

// Create script to load in the editor
const content = `/*
 * A demo of logical types in TypeScript. Check a type against a logical type,
 * i.e. some combination of complements, intersections and unions of types.
 *
 * A current limitation is that casts of types to a type suitable for comparison are
 * never parsed to a logical type, because this is unreliable. One consequence is
 * that TypeScript may raise misleading errors when passing a cast value to \`assign\`.
 * Find the code, including a small set of tests, at https://github.com/pieterjanv/logical_types.
 */

/*
 * The implementation is as follows.
 */
${await (await fetch(`${appUrl}/src/types/logic.ts`)).text()}
${(await (await fetch(`${appUrl}/src/logic.ts`)).text())
	.split('\n')
	.filter((line) => !line.startsWith('import ') && !line.startsWith('export * from '))
	.join('\n')
}

/*
 * Some examples
 */

/*
 * Using the casting function.
 */

// @ts-expect-error "Argument of type 'string' is not assignable to parameter of type 'Not<string> & Not<number>'."
const stringIsUnassignable = assign<Not<Or<[string, number]>>>()("test");

const booleanIsFine = assign<Not<Or<[string, number]>>>()(true);
booleanIsFine;


/*
 * Type a function that has logical types as parameters and return type.
 */
function takesNonNumberReturnsNonString<T>(
	x: In<T, And<[Not<number>, string]>>,
): Comparable<Not<string>> {
	return assign<Not<string>>()(x.length);
}

// @ts-expect-error "Argument of type 'number' is not assignable to parameter of type 'Not<number> & string'."
const numberIsUnassignable = takesNonNumberReturnsNonString(5);

const stringIsFine = takesNonNumberReturnsNonString("hello");
stringIsFine;
`;

const myScript =  monaco.editor.createModel(
	content,
	'typescript',
	monaco.Uri.file('/myScript.ts'),
);

// Create the editor
const myEditor = monaco.editor.create(document.getElementById("container"), {
	value: myScript.getValue(),
	language: "typescript",
	automaticLayout: true,
	theme: 'vs-dark',
});
myEditor.setPosition({ lineNumber: 1, column: 1 });
myEditor.focus();

// Set some necessary compiler options (and some optional ones)
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
	...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
	module: monaco.languages.typescript.ModuleKind.ESNext,
	moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
	target: monaco.languages.typescript.ScriptTarget.ESNext,
	strict: true,
	noLib: false,
	noEmit: true,
	baseUrl: './',
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // Style Options
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
});
