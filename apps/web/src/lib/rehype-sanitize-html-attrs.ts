/**
 * Converts a CSS style string (e.g. "color: blue; font-weight: bold; margin-top: 10px")
 * into a camelCase style object (e.g. { color: "blue", fontWeight: "bold", marginTop: "10px" }).
 */
export function parseStyleString(styleStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!styleStr || typeof styleStr !== 'string') return result;

  const declarations = styleStr.split(';');
  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx === -1) continue;
    const property = decl.slice(0, colonIdx).trim();
    const value = decl.slice(colonIdx + 1).trim();
    if (!property || !value) continue;

    let camelProperty = property;
    if (property.startsWith('-')) {
      const parts = property.slice(1).split('-');
      camelProperty =
        parts[0] +
        parts
          .slice(1)
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join('');
    } else {
      camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    result[camelProperty] = value;
  }
  return result;
}

/**
 * Constructs an MDX JSX Attribute Value Expression containing an ESTree ObjectExpression
 * for style properties in MDX AST nodes (mdxJsxTextElement / mdxJsxFlowElement).
 */
export function createStyleAttributeExpression(styleObj: Record<string, string>) {
  return {
    type: 'mdxJsxAttributeValueExpression',
    value: JSON.stringify(styleObj),
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        comments: [],
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'ObjectExpression',
              properties: Object.entries(styleObj).map(([k, v]) => ({
                type: 'Property',
                method: false,
                shorthand: false,
                computed: false,
                kind: 'init',
                key: { type: 'Identifier', name: k },
                value: { type: 'Literal', value: v, raw: JSON.stringify(v) },
              })),
            },
          },
        ],
      },
    },
  };
}

function walk(node: any, callback: (node: any) => void) {
  callback(node);
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      walk(child, callback);
    }
  }
}

/**
 * Rehype plugin to sanitize element attributes for React JSX in MDX:
 * 1. Intercepts `mdxJsxTextElement`, `mdxJsxFlowElement`, and standard `element` nodes.
 * 2. Converts string `style` attributes into ESTree style objects for React JSX.
 * 3. Converts deprecated <font color="...">, <font size="...">, <font face="..."> tags to <span> elements with CSS styles.
 * 4. Converts legacy align="..." attribute (e.g. <p align="center">) to CSS textAlign / float styles.
 */
export default function rehypeSanitizeHtmlAttrs() {
  return (tree: any) => {
    walk(tree, (node: any) => {
      // 1. Handle MDX JSX elements (mdxJsxTextElement, mdxJsxFlowElement)
      if (node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') {
        if (!node.attributes) node.attributes = [];

        // Convert <font> tag -> <span style={{...}}>
        if (node.name === 'font') {
          node.name = 'span';
          let styleObj: Record<string, string> = {};

          const styleAttrIdx = node.attributes.findIndex((a: any) => a.name === 'style');
          if (styleAttrIdx !== -1) {
            const val = node.attributes[styleAttrIdx].value;
            if (typeof val === 'string') {
              styleObj = parseStyleString(val);
            }
            node.attributes.splice(styleAttrIdx, 1);
          }

          const colorAttrIdx = node.attributes.findIndex((a: any) => a.name === 'color');
          if (colorAttrIdx !== -1) {
            const colorVal = node.attributes[colorAttrIdx].value;
            if (typeof colorVal === 'string' && colorVal) {
              styleObj.color = colorVal;
            }
            node.attributes.splice(colorAttrIdx, 1);
          }

          const sizeAttrIdx = node.attributes.findIndex((a: any) => a.name === 'size');
          if (sizeAttrIdx !== -1) {
            const fontSizes: Record<string, string> = {
              '1': '10px',
              '2': '12px',
              '3': '16px',
              '4': '18px',
              '5': '24px',
              '6': '32px',
              '7': '48px',
            };
            const sz = String(node.attributes[sizeAttrIdx].value);
            styleObj.fontSize = fontSizes[sz] || (isNaN(Number(sz)) ? sz : `${sz}px`);
            node.attributes.splice(sizeAttrIdx, 1);
          }

          const faceAttrIdx = node.attributes.findIndex((a: any) => a.name === 'face');
          if (faceAttrIdx !== -1) {
            styleObj.fontFamily = String(node.attributes[faceAttrIdx].value);
            node.attributes.splice(faceAttrIdx, 1);
          }

          if (Object.keys(styleObj).length > 0) {
            node.attributes.push({
              type: 'mdxJsxAttribute',
              name: 'style',
              value: createStyleAttributeExpression(styleObj),
            });
          }
        } else {
          // Process style attribute on non-font MDX JSX tags (e.g. <span style="color: blue">)
          for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            if (attr.name === 'style' && typeof attr.value === 'string') {
              const styleObj = parseStyleString(attr.value);
              attr.value = createStyleAttributeExpression(styleObj);
            }
          }
        }
      }

      // 2. Handle standard HAST HTML element nodes
      if (node.type === 'element') {
        if (!node.properties) {
          node.properties = {};
        }

        if (node.tagName === 'font') {
          node.tagName = 'span';
          let styleObj: Record<string, string> = {};

          if (typeof node.properties.style === 'string') {
            styleObj = parseStyleString(node.properties.style);
          } else if (typeof node.properties.style === 'object' && node.properties.style !== null) {
            styleObj = { ...node.properties.style };
          }

          if (node.properties.color) {
            styleObj.color = String(node.properties.color);
            delete node.properties.color;
          }

          if (node.properties.size) {
            const fontSizes: Record<string, string> = {
              '1': '10px',
              '2': '12px',
              '3': '16px',
              '4': '18px',
              '5': '24px',
              '6': '32px',
              '7': '48px',
            };
            const sz = String(node.properties.size);
            styleObj.fontSize = fontSizes[sz] || (isNaN(Number(sz)) ? sz : `${sz}px`);
            delete node.properties.size;
          }

          if (node.properties.face) {
            styleObj.fontFamily = String(node.properties.face);
            delete node.properties.face;
          }

          if (Object.keys(styleObj).length > 0) {
            node.properties.style = styleObj;
          }
        }

        if (typeof node.properties.style === 'string') {
          node.properties.style = parseStyleString(node.properties.style);
        }

        if (node.properties.align) {
          const alignVal = String(node.properties.align).toLowerCase();
          let styleObj: Record<string, string> = {};
          if (typeof node.properties.style === 'object' && node.properties.style !== null) {
            styleObj = { ...node.properties.style };
          }

          if (node.tagName === 'img') {
            if (alignVal === 'left' || alignVal === 'right') {
              styleObj.float = alignVal;
            }
          } else if (
            !styleObj.textAlign &&
            ['center', 'left', 'right', 'justify'].includes(alignVal)
          ) {
            styleObj.textAlign = alignVal;
          }

          delete node.properties.align;
          if (Object.keys(styleObj).length > 0) {
            node.properties.style = styleObj;
          }
        }
      }
    });
  };
}
