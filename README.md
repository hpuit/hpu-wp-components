# `@hpu-wp/components`

## Installation

### using package.json

Include the following dependencies in your package.json file:
```json
	"dependencies": {
		"@hpu-wp/components": "git+https://github.com/hpuit/hpu-wp-components.git"
	}
```

## `PostSearchControls` Component

The `PostSearchControls` component provides a robust interface for selecting one or multiple posts by searching and selecting them from a WordPress REST API. It handles multi-select functionality, asynchronous data fetching, and integrates seamlessly with Gutenberg blocks or other React-based interfaces.

---

### Features

- **Single and Multi-Post Selection**: Supports selecting a single post or multiple posts based on the provided props.
- **Customizable API Integration**: Works with custom API domains, namespaces, and post types.
- **Debounced Search**: Efficient search experience with debounced API calls.
- **Live Updates**: Updates the selected posts dynamically as changes occur.
- **Highly Configurable**: Options for custom labels, API endpoints, and callbacks.

---

### Installation

Include the component in your project:

```javascript
import { PostSearchControls } from '@hpu-wp/components';
```

Ensure you have dependencies like `@wordpress/element` and `@wordpress/components` installed in your environment.

---

### Props

| Prop              | Type                 | Description                                                                                     | Default                |
|--------------------|----------------------|-------------------------------------------------------------------------------------------------|------------------------|
| `postID`          | `number`            | ID of the initial post to select (single-select mode).                                          | `null`                |
| `postArray`       | `number[]`          | Array of post IDs to initialize in multi-select mode.                                           | `[]`                  |
| `onChange`        | `function`          | Callback fired when the selection changes. Receives the selected post ID(s) as an argument.    | `null`                |
| `searchLabel`     | `string`            | Label for the search input field.                                                              | `'Search Posts'`      |
| `apiDomain`       | `string`            | Base domain for the WordPress REST API.                                                        | `window.location.origin` |
| `apiNameSpace`    | `string`            | Custom namespace for the REST API.                                                             | `'wp/v2'`             |
| `postType`        | `string`            | Post type to search and fetch.                                                                 | `'posts'`             |
| `blogID`          | `number`            | Blog ID for multi-site installations.                                                          | `null`                |
| `blogPath`        | `string`            | Blog path for multi-site installations.                                                        | `null`                |

### Required

props *must* include:

either `postArray` OR `postID` for persistent selection on page load.

`onChange` method for handling selection changes

---

### Usage

You can switch between support for selecting single or multiple posts

If both `postID` and `postArray` are set, `postArray` will be used and `postID` ignored.

#### Single Post Selection

```javascript
<PostSearchControls
    postID={ 123 }
    onChange={ ( postID ) => console.log( 'Selected Post ID:', postID ) }
    searchLabel="Search for a Post"
    apiDomain="https://example.com"
    postType="custom-post-type"
/>
```

#### Multi-Post Selection

```javascript
<PostSearchControls
    postArray={ [ 1, 2, 3 ] }
    onChange={ ( postIDs ) => console.log( 'Selected Event IDs:', postIDs ) }
    searchLabel="Search for Events"
    apiNameSpace="custom/v1/events"
/>
```

---

### Multi-site Support

By default the PostSearchControls will run the search against the blog you are currently on, however it does support searching posts on other blogs

#### Using `blogPath`

Setting blog path is more performant on a subdirectory multisite as it passes the blog path to the api directly without looking up the path.

Using https://example.com/subsite/wp-json/
```javascript
<PostSearchControls
    postID={ 123 }
    blogPath='/subsite/'
    onChange={ ( postID ) => console.log( 'Selected Post ID:', postID ) }
    searchLabel="Search for a Post"
    apiDomain="https://example.com"
    postType="custom-post-type"
/>
```

Using https://example.com/wp-json/
```javascript
<PostSearchControls
    postID={ 123 }
    blogPath='/'
    onChange={ ( postID ) => console.log( 'Selected Post ID:', postID ) }
    searchLabel="Search for a Post"
    apiDomain="https://example.com"
    postType="custom-post-type"
/>
```

#### Using `blogID`

Will use the /blogs/ custom endpoint to retrieve blogpath for the api call and search by blogID

```javascript
<PostSearchControls
    postID={ 123 }
    blogID={ 3 }
    onChange={ ( postID ) => console.log( 'Selected Post ID:', postID ) }
    searchLabel="Search for a Post"
    apiDomain="https://example.com"
    postType="custom-post-type"
/>
```

---

### API Integration

The component constructs API endpoints dynamically based on the provided `apiDomain`, `apiNameSpace`, `postType`, `blogID`, and `blogPath` props. 
These properties are all optional.

Example Default Endpoint:

```
https://example.com/wp-json/wp/v2/posts?search=query
```

#### Using `apiDomain`

Default value: `window.location.origin`

Setting apiDomain will instruct the search to use another domain for the API post search.

#### Using `apiNameSpace`

Default value: `wp/v2`

Setting the apiNameSpace will allow using a custom endpoint to search for posts.

```javascript
<PostSearchControls
    postArray={ [ 1, 2, 3 ] }
    onChange={ ( postIDs ) => console.log( 'Selected Event IDs:', postIDs ) }
    searchLabel="Search for Events"
    apiNameSpace="custom/v1/events"
/>
```

note, using a custom api endpoint will assume the following parameters are available:
`search`, `per_page`, and `order_by`
additionally, it will be expected that responses will include:
 `title.rendered` and `id` as in the default WP post api.

#### Using `postType`

If using the default namespace, this will default to `posts`
When `apiNameSpace` is defined, this will default to an empty string.

Using postType provides a way to switch between postTypes for search, such as switching between 'posts' and 'pages'.

This value will be appended to the end of the `apiNameSpace`.  If using a custom endpoint that contains the postType anywhere other than after the namespace, you may need to dynamically generate a custom `apiNameSpace` instead.

```javascript
<PostSearchControls
    postID={ 123 }
    onChange={ ( postID ) => console.log( 'Selected Post ID:', postID ) }
    searchLabel="Search for a Post"
    postType="custom-post-type"
/>
```

---

### Customization

You can override styles using the following class names:

- `.post-search-control`: Wrapper for the component.
- `.post-search-control-selector`: Class for the search input.
- `.post-search-control-results`: Class for the dropdown containing search results.

---

### Dependencies

- `@wordpress/element`
- `@wordpress/components`
- WordPress REST API enabled on the backend.

---

### License

This component is provided under the [MIT License](https://opensource.org/licenses/MIT).
