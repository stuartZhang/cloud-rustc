'use strict';

module.exports = {
    root: true,
    extends: [
        'minxing/eslint-config-node8x.js'
    ],
    rules: {
        'no-param-reassign': 'off',
        'no-process-exit': 'off',
        'no-console': 'off',
        'template-curly-spacing': 'off',
        'indent': ['error', 4, {
            SwitchCase: 0,
            ignoredNodes: ['TemplateLiteral'],
            VariableDeclarator: {
                var: 1,
                let: 1,
                const: 1
            }
        }]
    }
};
