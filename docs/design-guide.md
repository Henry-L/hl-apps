# Design Guide

Consistent design language for all hl-apps projects.

## Components

### Use Ant Design
- **React apps**: Use `antd` package
- **Non-React apps**: Use Ant Design CSS via CDN or follow the visual style

```bash
npm install antd @ant-design/icons
```

```tsx
import { Button, Card, Input, Select, Table } from 'antd';
import { CheckCircleOutlined, SettingOutlined } from '@ant-design/icons';
```

**CDN for non-React apps:**
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/5.12.2/reset.min.css">
```

## Color Palette

### Grayscale (Primary)
| Name | Hex | Usage |
|------|-----|-------|
| Black | `#000000` | Primary text |
| Dark Gray | `#1f1f1f` | Headers, emphasis |
| Gray 700 | `#434343` | Secondary text |
| Gray 500 | `#8c8c8c` | Muted text, borders |
| Gray 300 | `#d9d9d9` | Dividers, light borders |
| Gray 100 | `#f5f5f5` | Backgrounds |
| White | `#ffffff` | Cards, content areas |

### Color Pops (Accent)
Use sparingly for emphasis, CTAs, and status indicators.

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary Action | Blue | `#1677ff` |
| Success | Green | `#52c41a` |
| Warning | Orange | `#faad14` |
| Error | Red | `#ff4d4f` |

### Usage Rules
- **90% grayscale** - Most of the UI
- **10% color pops** - CTAs, highlights, status badges
- **Never** use gradients or multiple accent colors together

## Typography

### Fonts
- **Primary**: System font stack (Ant Design default)
  ```css
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  ```

### Sizes
| Element | Size |
|---------|------|
| H1 | 32px |
| H2 | 24px |
| H3 | 20px |
| Body | 14px |
| Small | 12px |

## Icons & Emojis

### When to Use
- ✅ **Emojis** - Friendly highlights, status indicators, fun elements
- ✅ **Ant Design Icons** - Actions, navigation, form elements
- ❌ **Don't** - Overuse (max 3-4 per section)

### Examples
```tsx
// Good - emoji for status
<Tag>✅ Completed</Tag>

// Good - icon for action
<Button icon={<SettingOutlined />}>Settings</Button>

// Good - emoji in headers
<h1>🎯 Dashboard</h1>
```

## Layout Principles

### Simplistic Design
1. **Generous whitespace** - Don't crowd elements
2. **Clear hierarchy** - One primary action per section
3. **Card-based layouts** - Group related content in cards
4. **Maximum width** - Content max 1200px, centered

### Example Layout
```tsx
<Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
  <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
    <Card>
      <h1>📊 Page Title</h1>
      <p style={{ color: '#8c8c8c' }}>Subtitle or description</p>
      
      {/* Content */}
      
      <Button type="primary">Primary Action</Button>
    </Card>
  </Content>
</Layout>
```

## Component Patterns

### Buttons
```tsx
// Primary action (blue pop)
<Button type="primary">Submit</Button>

// Secondary action (grayscale)
<Button>Cancel</Button>

// Danger action (red pop)
<Button danger>Delete</Button>
```

### Cards
```tsx
<Card 
  title="📋 Section Title"
  style={{ borderRadius: 8 }}
>
  {/* Content */}
</Card>
```

### Tables
```tsx
<Table 
  dataSource={data}
  columns={columns}
  pagination={{ pageSize: 10 }}
  style={{ background: '#fff' }}
/>
```

### Forms
```tsx
<Form layout="vertical">
  <Form.Item label="Email" required>
    <Input placeholder="Enter email" />
  </Form.Item>
  <Form.Item>
    <Button type="primary" htmlType="submit">
      Submit
    </Button>
  </Form.Item>
</Form>
```

## CSS Variables (for non-React apps)

```css
:root {
  /* Grayscale */
  --color-black: #000000;
  --color-gray-900: #1f1f1f;
  --color-gray-700: #434343;
  --color-gray-500: #8c8c8c;
  --color-gray-300: #d9d9d9;
  --color-gray-100: #f5f5f5;
  --color-white: #ffffff;
  
  /* Pops */
  --color-primary: #1677ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

## Dark Mode (Optional)

If supporting dark mode:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1f1f1f;
    --color-surface: #2d2d2d;
    --color-text: #ffffff;
    --color-text-muted: #8c8c8c;
  }
}
```

## Checklist for New Apps

- [ ] Using Ant Design components (or matching style)
- [ ] Grayscale-dominant color palette
- [ ] 1-2 accent colors only (blue primary, red for errors)
- [ ] Emojis in headings/highlights
- [ ] Ant Design icons for actions
- [ ] Clean, minimal layout
- [ ] Proper whitespace
- [ ] Responsive design
- [ ] Favicon included

