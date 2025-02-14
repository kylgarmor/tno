import { DataSources } from 'features/my-reports/components';
import { IReportForm } from 'features/my-reports/interfaces';
import { useFormikContext } from 'formik';
import React from 'react';
import {
  Col,
  FormikCheckbox,
  FormikSelect,
  IOptionItem,
  OptionItem,
  ReportSectionOrderByOptions,
  Row,
} from 'tno-core';

export interface IReportSectionContentProps {
  index: number;
}

/**
 * Component provides a way to configure a section that contains content.
 * Content can be provided by a filter or a folder.
 * A content section can also display charts.
 */
export const ReportSectionContent = React.forwardRef<HTMLDivElement, IReportSectionContentProps>(
  ({ index, ...rest }, ref) => {
    const { values, setFieldValue } = useFormikContext<IReportForm>();

    const [orderOptions] = React.useState<IOptionItem[]>(ReportSectionOrderByOptions);

    const section = values.sections[index];

    return (
      <Col gap="0.5rem">
        <DataSources index={index} className="section-options" />
        <Row className="frm-in section-options">
          <label>Sort Stories By:</label>
          <Col flex="1">
            <FormikSelect
              name={`sections.${index}.settings.sortBy`}
              options={orderOptions}
              value={orderOptions.find((o) => o.value === section.settings.sortBy) ?? ''}
              onChange={(newValue: any) => {
                const option = newValue as OptionItem;
                const order = orderOptions.find((f) => f.value === option?.value);
                if (order) setFieldValue(`sections.${index}.settings.sortBy`, order.value);
              }}
            />
          </Col>
        </Row>
        <Col className="frm-in">
          <label>Report Section Options</label>
          <FormikCheckbox
            name={`sections.${index}.settings.hideEmpty`}
            label="Hide this section in the report when empty"
          />
          <FormikCheckbox
            name={`sections.${index}.settings.removeDuplicates`}
            label="Remove duplicate stories"
            tooltip="Remove content from this section that is in above sections"
          />
          <FormikCheckbox
            name={`sections.${index}.settings.showFullStory`}
            label="Show Full Story"
            tooltip="Display the full story for each content item in this section"
          />
          <FormikCheckbox
            name={`sections.${index}.settings.showImage`}
            label="Show Image"
            tooltip="Display the image for each content item in this section (if there is an image)"
          />
          <FormikCheckbox
            name={`sections.${index}.settings.showHeadlines`}
            label="Show additional Table of Content for this section"
            tooltip="Display a Table of Contents at the beginning of this section."
          />
        </Col>
      </Col>
    );
  },
);
