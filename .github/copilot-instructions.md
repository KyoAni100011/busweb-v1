This project follows strict frontend standards. Follow these instructions carefully:
Package Management & Tooling
- Use npm for dependency management.
- Use TypeScript: .tsx for components, .ts for utilities.
- Use shadcn/ui for styling

Code Style:
- Use React functional components with Hooks only, avoid class components.
- Format code with single quotes and add a newline before return statements.
- Use REACT.FC for component types
- Always fix lint erros, remove unused imports and format before commiting:

Code references
- Refer to existing components, ststyles, types, constants, utils, helpers, contextes when adding or modifying code.

Complexity Standards:
- Awlays ensure functions complexity <= 15
- if a function excees this, split it into smaller helper functions.
- Keep code modular, readable and testable.

Follow all these conventions to maintain consistency, quality and reviewability across the codebase.