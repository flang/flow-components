/*
 * Copyright 2000-2023 Vaadin Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package com.vaadin.flow.component.grid.it;

import java.util.stream.Collectors;
import java.util.stream.IntStream;

import com.vaadin.flow.component.checkbox.Checkbox;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.grid.GridMultiSelectionModel;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Route;

/**
 * Test view for grid's select rows by dragging feature.
 */
@Route("vaadin-grid/grid-select-rows-by-dragging")
public class GridSelectRowsByDraggingPage extends VerticalLayout {

    public static final int ITEM_COUNT = 100;

    static final String SELECT_ROWS_BY_DRAGGING_GRID_ID = "select-rows-by-dragging-grid";
    static final String TOGGLE_SELECT_ROWS_BY_DRAGGING_CHECKBOX = "toggle-select-rows-by-dragging-checkbox";

    public GridSelectRowsByDraggingPage() {
        createGridMultiRowSelectionByDragging();
    }

    private void createGridMultiRowSelectionByDragging() {
        Grid<String> grid = new Grid<>();
        grid.setId(SELECT_ROWS_BY_DRAGGING_GRID_ID);
        grid.setItems(IntStream.range(0, ITEM_COUNT).mapToObj(Integer::toString)
                .collect(Collectors.toList()));
        grid.addColumn(i -> i).setHeader("text");
        grid.addColumn(i -> String.valueOf(i.length())).setHeader("length");
        grid.setSelectionMode(Grid.SelectionMode.MULTI);

        Checkbox toggleSelectRowsByDragging = new Checkbox(
                "Select Rows by Dragging");
        toggleSelectRowsByDragging
                .setId(TOGGLE_SELECT_ROWS_BY_DRAGGING_CHECKBOX);
        toggleSelectRowsByDragging.setValue(false);
        toggleSelectRowsByDragging.addValueChangeListener(
                e -> ((GridMultiSelectionModel<String>) grid
                        .getSelectionModel())
                                .setSelectRowsByDragging(e.getValue()));

        add(new H2("Grid with select rows by dragging support"), grid,
                toggleSelectRowsByDragging);
    }
}
