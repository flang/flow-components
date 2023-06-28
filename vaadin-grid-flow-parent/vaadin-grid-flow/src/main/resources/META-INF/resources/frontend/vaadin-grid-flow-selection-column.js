import '@vaadin/grid/vaadin-grid-column.js';
import { GridColumn } from '@vaadin/grid/src/vaadin-grid-column.js';
import { addListener } from '@vaadin/component-base/src/gestures.js';
{
  class GridFlowSelectionColumnElement extends GridColumn {

    static get is() {
      return 'vaadin-grid-flow-selection-column';
    }

    static get properties() {
      return {

        /**
         * Automatically sets the width of the column based on the column contents when this is set to `true`.
         */
        autoWidth: {
          type: Boolean,
          value: true
        },

        /**
         * Width of the cells for this column.
         */
        width: {
          type: String,
          value: '56px'
        },

        /**
         * Flex grow ratio for the cell widths. When set to 0, cell width is fixed.
         */
        flexGrow: {
          type: Number,
          value: 0
        },

        /**
         * When true, all the items are selected.
         */
        selectAll: {
          type: Boolean,
          value: false,
          notify: true
        },
        
        /**
         * When true, rows can be selected by dragging mouse cursor over selection column.
         * @attr {boolean} select-rows-by-dragging
         * @type {boolean}
         */
        selectRowsByDragging: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        /**
         * Whether to display the select all checkbox in indeterminate state,
         * which means some, but not all, items are selected
         */
        indeterminate: {
          type: Boolean,
          value: false,
          notify: true
        },

        selectAllHidden: Boolean
      };
    }

    constructor() {
      super();
      this._boundOnSelectEvent = this._onSelectEvent.bind(this);
      this._boundOnDeselectEvent = this._onDeselectEvent.bind(this);
      this.__onSelectionColumnCellTrack = this.__onSelectionColumnCellTrack.bind(this);
    }

    static get observers() {
      return [
        '_onHeaderRendererOrBindingChanged(_headerRenderer, _headerCell, path, header, selectAll, indeterminate, selectAllHidden)'
      ];
    }

    /** @private */
    connectedCallback() {
      super.connectedCallback();
      if (this._grid) {
        this._grid.addEventListener('select', this._boundOnSelectEvent);
        this._grid.addEventListener('deselect', this._boundOnDeselectEvent);
      }
    }

    /** @private */
    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._grid) {
        this._grid.removeEventListener('select', this._boundOnSelectEvent);
        this._grid.removeEventListener('deselect', this._boundOnDeselectEvent);
      }
    }

    /**
     * Renders the Select All checkbox to the header cell.
     *
     * @override
     */
    _defaultHeaderRenderer(root, _column) {
      let checkbox = root.firstElementChild;
      if (!checkbox) {
        checkbox = document.createElement('vaadin-checkbox');
        checkbox.id = 'selectAllCheckbox';
        checkbox.setAttribute('aria-label', 'Select All');
        checkbox.classList.add('vaadin-grid-select-all-checkbox');
        checkbox.addEventListener('click', this._onSelectAllClick.bind(this));
        root.appendChild(checkbox);
      }

      const checked = this.selectAll;
      checkbox.hidden = this.selectAllHidden;
      checkbox.checked = checked;
      checkbox.indeterminate = this.indeterminate;
    }
    
    /** @private */
  __lassoAutoScroller() {
    if (this.__lassoDragStartIndex !== undefined) {
      // Get the row being hovered over
      const renderedRows = this._grid._getRenderedRows();
      let rowHeight = 30;
      const hoveredRow = renderedRows.find((row) => {
        const rowRect = row.getBoundingClientRect();
        rowHeight = rowRect.height;
        return this.__lassoCurrentY >= rowRect.top && this.__lassoCurrentY <= rowRect.bottom;
      });

      // Get the index of the row being hovered over or the first/last
      // visible row if hovering outside the grid
      let hoveredIndex = hoveredRow ? hoveredRow.index : undefined;
      const gridRect = this._grid.getBoundingClientRect();
      if (this.__lassoCurrentY < gridRect.top) {
        hoveredIndex = this._grid._firstVisibleIndex;
      } else if (this.__lassoCurrentY > gridRect.bottom) {
        hoveredIndex = this._grid._lastVisibleIndex;
      }

      if (hoveredIndex !== undefined) {
        // Select all items between the start and the current row
        renderedRows.forEach((row) => {
          if (
            (hoveredIndex > this.__lassoDragStartIndex &&
              row.index >= this.__lassoDragStartIndex &&
              row.index <= hoveredIndex) ||
            (hoveredIndex < this.__lassoDragStartIndex &&
              row.index <= this.__lassoDragStartIndex &&
              row.index >= hoveredIndex)
          ) {
            if (this.__lassoSelect) {
			  this._grid.$connector.doSelection([row._item], true)
            } else {
              this._grid.$connector.doDeselection([row._item], true)
            }
          }
        });
      }

      // Auto scroll the grid
      this._grid.$.table.scrollTop += (this.__lassoDy || 0) / (rowHeight / 2);

      // Schedule the next auto scroll
      setTimeout(() => this.__lassoAutoScroller(), 100);
    }
  }

  /** @private */
  __onSelectionColumnCellTrack(event) {
	if (!this.selectRowsByDragging) {
		return;
	}
    this.__lassoDy = event.detail.dy;
    this.__lassoCurrentY = event.detail.y;
    if (event.detail.state === 'start') {
      this._grid.setAttribute('disable-text-selection', true);
      this.__lassoWasEnabled = true;
      const renderedRows = this._grid._getRenderedRows();
      // Get the row where the drag started
      const lassoStartRow = renderedRows.find((row) => row.contains(event.currentTarget.assignedSlot));
      // Whether to select or deselect the items on drag
      this.__lassoSelect = !this._grid._isSelected(lassoStartRow._item);
      // Store the index of the row where the drag started
      this.__lassoDragStartIndex = lassoStartRow.index;
      // Start the auto scroller
      this.__lassoAutoScroller();
    } else if (event.detail.state === 'end') {
      this.__lassoDragStartIndex = undefined;
      this._grid.removeAttribute('disable-text-selection');
    }
  }

    /**
     * Renders the Select Row checkbox to the body cell.
     *
     * @override
     */
    _defaultRenderer(root, _column, { item, selected }) {
      let checkbox = root.firstElementChild;
      if (!checkbox) {
        checkbox = document.createElement('vaadin-checkbox');
        checkbox.setAttribute('aria-label', 'Select Row');
        checkbox.addEventListener('click', this._onSelectClick.bind(this));
        root.appendChild(checkbox);
        addListener(root, 'track', this.__onSelectionColumnCellTrack);
      }
      checkbox.__item = item;
      checkbox.checked = selected;
    }

    _onSelectClick(e) {
      e.currentTarget.checked ? this._grid.$connector.doDeselection([e.currentTarget.__item], true) : this._grid.$connector.doSelection([e.currentTarget.__item], true);
    }

    _onSelectAllClick(e) {
      e.preventDefault();
      if (this._grid.hasAttribute('disabled')) {
        e.currentTarget.checked = !e.currentTarget.checked;
        return;
      }
      this.selectAll ? this.$server.deselectAll() : this.$server.selectAll();
    }

    _onSelectEvent(e) {
    }

    _onDeselectEvent(e) {
      if (e.detail.userOriginated) {
        this.selectAll = false;
      }
    }
  }

  customElements.define(GridFlowSelectionColumnElement.is, GridFlowSelectionColumnElement);

  Vaadin.GridFlowSelectionColumnElement = GridFlowSelectionColumnElement;
}
