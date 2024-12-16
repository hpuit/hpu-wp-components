# @hpu-wp/components

## Table of Contents

- [Installation](#installation)
    - [using package.json](#using-packagejson)
    - [Dependencies](#dependencies)
- [Components](#components)
    - [AssociatedSiteControls Component](#associatedsitecontrols-component)
        - [Features](#features)
        - [Importing](#importing)
        - [Props](#props)
        - [Required](#required)
        - [Usage](#usage)
    - [BlogSelectControls Component](#blogselectcontrols-component)
        - [Features](#features-1)
        - [Importing](#importing-1)
        - [Props](#props-1)
        - [Required](#required-1)
        - [Usage](#usage-1)
    - [PostSearchControls Component](#postsearchcontrols-component)
        - [Features](#features-2)
        - [Importing](#importing-2)
        - [Props](#props-2)
        - [Required](#required-2)
        - [Usage](#usage-2)
        - [Multi-site Support](#multi-site-support)
        - [API Integration](#api-integration)
- [License](#license)

## Installation

### using package.json

Include the following dependencies in your package.json file:
```json
	"dependencies": {
		"@hpu-wp/components": "git+https://github.com/hpuit/hpu-wp-components.git"
	}
```

### Dependencies

- `@wordpress/element`
- `@wordpress/components`
- WordPress REST API enabled on the backend.
- hpu/v1 custom api developed for hpu24 theme for multisite support.

## Components

### **AssociatedSiteControls** Component

The `AssociatedSiteControls` component provides a method for searching for and selecting one or more blogs for setting as associated site

---

The `AssociatedSiteControls` component provides an interface for selecting one or multiple sites by searching and selecting them from hpu-wp blogs API. It handles multi-select functionality, asynchronous data fetching, and integrates seamlessly with Gutenberg blocks or other React-based interfaces.

#### Features

- **Single and Multi-Post Selection**: Supports toggling between multiple sites and single site selection for filters and assignment controls.
- **Filtered Search**: Filter sites using substring search against all sites, shows both selected and filtered contents.

#### Importing

Include the component in your project:

```javascript
import { AssociatedSiteControls } from '@hpu-wp/components';
```

Ensure you have dependencies `@wordpress/element` and `@wordpress/components` installed in your environment.

#### Props

| Prop            | Type       | Required | Description                                                                                           | Default                                                  |
|-----------------|------------|----------|-------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| `onChange`      | `function` | Yes      | Callback fired when the selection changes. Receives an array if using isMultiSelect else a single ID. | `null`                                                   |
| `siteArray`     | `number[]` | Yes*     | Array of already selected sites for the multiselect version.                                          | `[]`                                                     |
| `siteID`        | `number`   | Yes*     | ID of already selected site for the single select version.                                            | `null`                                                   |
| `isMultiSelect` | `bool`     | No       | Optional. Set to true to enable multiselect version of the component.                                 | `false`                                                  |
| `className`     | `string`   | No       | Extend the classname.                                                                                 | ''                                                       |
| `label`         | `string`   | No       | Label for the Selector Control.                                                                       | 'Associated Site' or 'Associated Sites' if isMultiSelect |

#### Required

props *must* include:

- either `siteArray` OR `siteID` for persistent selection on page load.
- `onChange` method for handling selection changes.

#### Usage

Multiselect mode:

```javascript
<AssociatedSiteControls
    siteArray={ attributes.AssociatedSites } // array
    onChange={ ( value ) => { setAttributes( { AssociatedSites: value } ) } }
/>
```

Singleselect mode:

```javascript
<AssociatedSiteControls
    siteID={ attributes.AssociatedSite } // integer
    onChange={ ( value ) => { setAttributes( { AssociatedSite: value } ) } }
/>
```

---

### **BlogSelectControls** Component

The `BlogSelectControls` component provides an interface to select any blog in a multisite network with search filtering.

---

#### Features

- **Searchable blog list controls**: Supports filtering results to find specific blogs

#### Importing

Include the component in your project:

```javascript
import { BlogSelectControls } from '@hpu-wp/components';
```

Ensure you have dependencies `@wordpress/element` and `@wordpress/components` installed in your environment.

#### Props

| Prop        | Type       | Required | Description                                                                                           | Default                  |
|-------------|------------|----------|-------------------------------------------------------------------------------------------------------|--------------------------|
| `blogID`    | `number`   | Yes      | Pass the currently selected blogID to the component.                                                  | `null`                   |
| `onChange`  | `function` | Yes      | Callback fired when the selection changes. Receives an array if using isMultiSelect else a single ID. | `null`                   |
| `apiDomain` | `string`   | No       | Base domain for the WordPress REST API.                                                               | `window.location.origin` |

#### Required

props *must* include:

- either `blogID` for persistent selection on page load.
- `onChange` method for handling selection changes.

#### Usage

```javascript
<SelectBlogControls
    blogID={ attributes.blogID }
    onChange={ ( value ) => setAttributes( { blogID: value } ) }
/>
```

---

### **CurrentlySelected** Component

The `CurrentlySelected` component provides a method for displaying selected posts on its own, or included as a subcomponent of PostSearchControls.

---

#### Features

- **Multi-Post Card Interface**: Displays a list of posts in cards with a remove post button.

#### Importing

Include the component in your project:

```javascript
import { CurrentlySelected } from '@hpu-wp/components';
```

Ensure you have dependencies `@wordpress/element` and `@wordpress/components` installed in your environment.

#### Props

| Prop            | Type       | Required | Description                                                                                           | Default              |
|-----------------|------------|----------|-------------------------------------------------------------------------------------------------------|----------------------|
| `onRemove`      | `function` | Yes      | Callback fired when the remove button is pressed. returns a single ID for the selected post.          | `null`               |
| `selectedItems` | `number[]` | Yes*     | Array of already selected items for the multiselect version.                                          | `[]`                 |
| `selectedItem`  | `number`   | Yes*     | ID of already selected item for the single select version.                                            | `null`               |
| `label`         | `string`   | No       | Label for the Currently Selected Interface.                                                           | 'Currently Selected' |

#### Required

props *must* include:

- either `selectedItems` OR `selectedItem` for persistent selection on page load.
- `onRemove` method for handling post removal.

#### Usage

Multiselect mode:

```javascript
<CurrentlySelected
    selectedItems={ postArray } // array
    onRemove={ ( value ) => { removePost( value ) } } // function to handle removing a single post by ID
/>
```

Singleselect mode:

```javascript
<CurrentlySelected
    selectedItem={ postID } // integer
    onRemove={ ( value ) => { removePost( value ) } } // function to handle removing a single post by ID
/>
```

---

### `PostSearchControls` Component

The `PostSearchControls` component provides a robust interface for selecting one or multiple posts by searching and selecting them from a WordPress REST API. It handles multi-select functionality, asynchronous data fetching, and integrates seamlessly with Gutenberg blocks or other React-based interfaces.

---

#### Features

- **Single and Multi-Post Selection**: Supports selecting a single post or multiple posts based on the provided props.
- **Customizable API Integration**: Works with custom API domains, namespaces, and post types.
- **Debounced Search**: Efficient search experience with debounced API calls.
- **Live Updates**: Updates the selected posts dynamically as changes occur.
- **Highly Configurable**: Options for custom labels, API endpoints, and callbacks.

---

#### Importing

Include the component in your project:

```javascript
import { PostSearchControls } from '@hpu-wp/components';
```

Ensure you have dependencies `@wordpress/element` and `@wordpress/components` installed in your environment.

---

#### Props

| Prop            | Type       | Required | Description                                                                                                        | Default                  |
|-----------------|------------|----------|--------------------------------------------------------------------------------------------------------------------|--------------------------|
| `onChange`      | `function` | Yes      | Callback fired when the selection changes. Receives an array if using `postArray` or a single ID if using `postID` | `null`                   |
| `postArray`     | `number[]` | Yes*     | Array of post IDs to initialize in multi-select mode. (required for multi-post select)                             | `[]`                     |
| `postID`        | `number`   | Yes*     | ID of the initial post to select (single-select mode). (required for single post select)                           | `null`                   |
| `apiDomain`     | `string`   | No       | Base domain for the WordPress REST API.                                                                            | `window.location.origin` |
| `apiNameSpace`  | `string`   | No       | Custom namespace for the REST API.                                                                                 | 'wp/v2'                  |
| `blogID`        | `number`   | No       | Blog ID for multi-site installations.                                                                              | `null`                   |
| `blogPath`      | `string`   | No       | Blog path for multi-site installations.                                                                            | `null`                   |
| `className`     | `string`   | No       | Extend the classname                                                                                               | ''                       |
| `placement`     | `string`   | No       | Optional placement prop for Popover subcomponent                                                                   | 'left-start'             |
| `postType`      | `string`   | No       | Post type to search and fetch.                                                                                     | 'posts'                  |
| `searchLabel`   | `string`   | No       | Label for the search input field.                                                                                  | 'Search Posts'           |
| `selectedLabel` | `string`   | No       | Label for selected posts section                                                                                   | 'Selected Posts'         |
| `wpNonce`       | `string`   | No       | For passing an optional nonce field to the API endpoint                                                            | ''                       |

#### Required

props *must* include:

- either `postArray` OR `postID` for persistent selection on page load.
- `onChange` method for handling selection changes.

---

#### Usage

You can switch between support for selecting single or multiple posts

If both `postID` and `postArray` are set, `postArray` will be used and `postID` ignored.

##### Single Post Selection

```javascript
<PostSearchControls
    postID={ 123 }
    onChange={ ( postID ) => console.log( 'Selected Post ID:', postID ) }
    searchLabel="Search for a Post"
    apiDomain="https://example.com"
    postType="custom-post-type"
/>
```

##### Multi-Post Selection

```javascript
<PostSearchControls
    postArray={ [ 1, 2, 3 ] }
    onChange={ ( postIDs ) => console.log( 'Selected Event IDs:', postIDs ) }
    searchLabel="Search for Events"
    apiNameSpace="custom/v1/events"
/>
```

---

#### Multi-site Support

By default the PostSearchControls will run the search against the blog you are currently on, however it does support searching posts on other blogs

##### Using `blogPath`

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

##### Using `blogID`

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

#### API Integration

The component constructs API endpoints dynamically based on the provided `apiDomain`, `apiNameSpace`, `postType`, `blogID`, and `blogPath` props. 
These properties are all optional.

Example Default Endpoint:

```
https://example.com/wp-json/wp/v2/posts?search=query
```

##### Using `apiDomain`

Default value: `window.location.origin`

Setting apiDomain will instruct the search to use another domain for the API post search.

##### Using `apiNameSpace`

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

##### Using `postType`

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

## License

This component is provided under the [MIT License](https://opensource.org/licenses/MIT).
