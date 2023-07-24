import '@vaadin/grid/vaadin-grid-column.js';
import { addListener } from '@vaadin/component-base/src/gestures.js';
import { GridColumn } from '@vaadin/grid/src/vaadin-grid-column.js';
import { GridSelectionColumnBaseMixin } from '@vaadin/grid/src/vaadin-grid-selection-column-base-mixin.js';
{
  class GridFlowSelectionColumnElement extends GridSelectionColumnBaseMixin(GridColumn) {
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
          value: true,
        },
      };
    }

    constructor() {
      super();
      this._boundOnSelectEvent = this._onSelectEvent.bind(this);
      this._boundOnDeselectEvent = this._onDeselectEvent.bind(this);
      this.__onSelectionColumnCellTrack = this.__onSelectionColumnCellTrack.bind(this);
      this.__onSelectionColumnCellMouseDown = this.__onSelectionColumnCellMouseDown.bind(this);
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
      checkbox.hidden = this._selectAllHidden;
      checkbox.checked = checked;
      checkbox.indeterminate = this._indeterminate;
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
        root.addEventListener('mousedown', this.__onSelectionColumnCellMouseDown);
      }
      checkbox.__item = item;
      checkbox.checked = selected;
    }

    _onSelectClick(e) {
      // ignore checkbox mouse click if start item was already selected or deselected by lasso selection
      if (this.selectRowsByDragging && this.__lassoDragStartItem) {
        e.preventDefault();
      } else {
        e.currentTarget.checked ? this._deselectItem(e.currentTarget.__item) : this._selectItem(e.currentTarget.__item);
      }
      this.__lassoDragStartItem = undefined;
    }

    _onSelectAllClick(e) {
      e.preventDefault();
      if (this._grid.hasAttribute('disabled')) {
        e.currentTarget.checked = !e.currentTarget.checked;
        return;
      }
      this.selectAll ? this.$server.deselectAll() : this.$server.selectAll();
    }

    _onSelectEvent(e) {}

    _onDeselectEvent(e) {
      if (e.detail.userOriginated) {
        this.selectAll = false;
      }
    }

    /**
     * Override a method from `GridSelectionColumnBaseMixin` to handle the user
     * selecting an item.
     *
     * @param {Object} item the item to select
     * @protected
     * @override
     */
    _selectItem(item) {
      this._grid.$connector.doSelection([item], true);
    }

    /**
     * Override a method from `GridSelectionColumnBaseMixin` to handle the user
     * deselecting an item.
     *
     * @param {Object} item the item to deselect
     * @protected
     * @override
     */
    _deselectItem(item) {
      this._grid.$connector.doDeselection([item], true);
    }
  }

  customElements.define(GridFlowSelectionColumnElement.is, GridFlowSelectionColumnElement);

  Vaadin.GridFlowSelectionColumnElement = GridFlowSelectionColumnElement;
}
