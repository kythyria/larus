Context menus are gotten by calling ContextMenu.show(ctx), where ctx is an array of objects with the following structure.

<table>
<thead>
<tr><th>Name</th><th>Type</th><th>Description</th></tr>
</thead>
<tbody>
<tr><td><code>name</code>    </td><td><code>string</code>  </td><td>Text to display for this entry</td></tr>
<tr><td><code>shortcut</code></td><td><code>string</code>  </td><td>Text displayed for the shortcut keys (optional)</td></tr>
<tr><td><code>callback</code></td><td><code>function</code></td><td>Function to call when the entry is selected</td></tr>
<tr><td><code>default</code> </td><td><code>boolean</code> </td><td>If true, the entry will be emboldened and pre-selected.</td></tr>
</tbody>
</table>