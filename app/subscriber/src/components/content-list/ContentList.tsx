import { IContentSearchResult } from 'features/utils/interfaces';
import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import { useContent, useLookup } from 'store/hooks';
import { IContentModel, Settings, Show } from 'tno-core';

import { ContentListContext } from './ContentListContext';
import { ContentRow } from './ContentRow';
import * as styled from './styled';
import { groupContent } from './utils';

export interface IContentListProps {
  /** content is an array of content objects to be displayed and manipulated by the content list*/
  content: IContentSearchResult[];
  /** determine the selected content based on the checkbox */
  onContentSelected: (content: IContentModel[]) => void;
  /** array of selected content */
  selected: IContentModel[];
  /** prop to determine whether to style the content based on user settings */
  styleOnSettings?: boolean;
  /** determine whether to show date next to the sentiment icon */
  showDate?: boolean;
  /** show the time the content was published */
  showTime?: boolean;
  /** used to determine if the content list is draggable and what to do for handling drop */
  handleDrop?: any;
  /** whether or not the content list is scrollable from within the content list container*/
  scrollWithin?: boolean;
  /** determine whether or not to show the series title */
  showSeries?: boolean;
  /** Whether to store the state of the checkboxes in cache */
  cacheCheck?: boolean;
}

export const ContentList: React.FC<IContentListProps> = ({
  content,
  onContentSelected,
  selected,
  styleOnSettings = false,
  showDate = false,
  handleDrop,
  scrollWithin = false,
  showSeries = false,
  showTime = false,
  cacheCheck = true,
}) => {
  const navigate = useNavigate();
  const { groupBy, setActiveStream, activeFileReference } = React.useContext(ContentListContext);
  const grouped = groupContent(groupBy, [...content]);
  const [, { stream }] = useContent();
  const [{ settings }] = useLookup();

  // just on init we want to see if anything in local storage
  React.useEffect(() => {
    if (!cacheCheck) return;
    const existing = localStorage.getItem('selected');
    if (existing) {
      onContentSelected(JSON.parse(existing));
    }
    // only want to fire once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // this will update the local storage with the selected content
  React.useEffect(() => {
    if (!cacheCheck) return;
    const existing = localStorage.getItem('selected');
    let array;
    if (existing) {
      array = JSON.parse(existing);
    } else {
      array = [];
    }
    if (array.lenth !== selected.length) {
      array = selected;
    }
    localStorage.setItem('selected', JSON.stringify(array));
    // only want to fire when selected changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const handleCheckboxChange = React.useCallback(
    (item: IContentModel, isChecked: boolean) => {
      if (isChecked) {
        onContentSelected([...selected, item]);
      } else {
        onContentSelected(selected.filter((selectedItem) => selectedItem.id !== item.id));
      }
    },
    [onContentSelected, selected],
  );

  React.useEffect(() => {
    if (!!activeFileReference) {
      stream(activeFileReference.path).then((result) => {
        setActiveStream({ source: result, id: activeFileReference.contentId });
      });
    }
  }, [activeFileReference, stream, setActiveStream]);

  const popOutIds = React.useMemo(() => {
    return settings.find((setting) => setting.name === Settings.SearchPageResultsNewWindow)?.value;
  }, [settings]);

  return (
    <styled.ContentList scrollWithin={scrollWithin}>
      <Show visible={!handleDrop}>
        {Object.keys(grouped).map((group) => (
          <div key={group}>
            <h2 className="group-title">{group}</h2>
            <div>
              {grouped[group].map((item) => (
                <ContentRow
                  className={`${
                    selected.some((selectedItem) => selectedItem.id === item.id) ? 'checked' : ''
                  }`}
                  key={item.id}
                  selected={selected}
                  popOutIds={popOutIds}
                  showSeries={showSeries}
                  showDate={showDate}
                  showTime={showTime}
                  styleOnSettings={styleOnSettings}
                  item={item}
                  onCheckboxChange={handleCheckboxChange}
                />
              ))}
            </div>
          </div>
        ))}
      </Show>
      <Show visible={!!handleDrop}>
        <DragDropContext onDragEnd={handleDrop}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {content.map((item: IContentModel, index: number) => (
                  <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="full-draggable"
                      >
                        <ContentRow
                          className={`${
                            selected.some((selectedItem) => selectedItem.id === item.id)
                              ? 'checked'
                              : ''
                          }`}
                          popOutIds={popOutIds}
                          showDate={showDate}
                          styleOnSettings={styleOnSettings}
                          onClick={(e) => {
                            // Ensure the target is an Element and use .closest to check if the click was inside a checkbox (see comment below)
                            if (!(e.target instanceof Element) || !e.target.closest('.checkbox')) {
                              navigate(`/view/${item.id}`);
                            }
                          }}
                          selected={selected}
                          canDrag
                          item={item}
                          onCheckboxChange={handleCheckboxChange}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Show>
    </styled.ContentList>
  );
};
