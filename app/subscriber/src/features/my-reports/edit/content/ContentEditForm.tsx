import { Bar } from 'components/bar';
import { Button } from 'components/button';
import { Sentiment } from 'components/sentiment';
import { IReportForm, IReportInstanceContentForm } from 'features/my-reports/interfaces';
import { IContentValidationErrors } from 'features/my-reports/interfaces/IContentValidationErrors';
import { toForm } from 'features/my-reports/utils';
import { formatDate } from 'features/utils';
import React from 'react';
import { FaX } from 'react-icons/fa6';
import { useApp, useContent, useReports } from 'store/hooks';
import { Col, ContentTypeName, IContentModel } from 'tno-core';

import { useReportEditContext } from '../ReportEditContext';
import { ContentActions, ContentForm, UserContentForm } from './stories';
import * as styled from './styled';

export interface IContentEditFormProps {
  /** Whether edit functionality is disabled. */
  disabled?: boolean;
}

/**
 * Provides a form to edit content in a report.
 * Handles editor content and custom subscriber content.
 * @param param0 Component properties.
 * @returns Component.
 */
export const ContentEditForm = ({ disabled }: IContentEditFormProps) => {
  const [{ userInfo }] = useApp();
  const [, { updateReport }] = useReports();
  const [, { addContent, updateContent }] = useContent();
  const { values, onNavigate, isSubmitting, setSubmitting, setValues, activeRow, setActiveRow } =
    useReportEditContext();

  const [form, setForm] = React.useState<IReportInstanceContentForm | undefined>(activeRow);
  const [errors, setErrors] = React.useState<IContentValidationErrors>();

  const instance = values.instances.length ? values.instances[0] : undefined;
  const userId = userInfo?.id ?? 0;

  React.useEffect(() => {
    setForm(activeRow);
  }, [activeRow]);

  const validate = (values: IContentModel) => {
    const err: IContentValidationErrors = { hasErrors: false };
    if (!values.headline) {
      err.headline = 'Headline is Required.';
      err.hasErrors = true;
    }
    if (!values.otherSource) {
      err.source = 'Source is Required.';
      err.hasErrors = true;
    }
    if (!values.publishedOn) {
      err.publishedOn = 'Published On is Required.';
      err.hasErrors = true;
    }
    setErrors(err);
    return err;
  };

  const handleAddUpdateContent = React.useCallback(
    async (values: IReportForm, row: IReportInstanceContentForm) => {
      try {
        setSubmitting(true);
        const content = row.content;
        if (!content) return null;
        const err = validate(content);
        if (err.hasErrors) return null;
        const originalId = content.id;
        const contentResult = !content.id
          ? await addContent(content)
          : await updateContent(content);
        if (contentResult) {
          const instanceContent: IReportInstanceContentForm = {
            contentId: contentResult.id,
            content: contentResult,
            instanceId: row.instanceId,
            sectionName: row.sectionName,
            sortOrder: 0,
            originalIndex: row.originalIndex,
          };
          setForm(instanceContent);
          setActiveRow(instanceContent);
          if (!originalId) {
            // Added content needs to update the report instance.
            const instance = values.instances.length ? values.instances[0] : undefined;
            if (!instance) return null;

            // Resort section and place new content at the beginning.
            const sectionIndex = instance.content.findIndex(
              (c) => c.sectionName === row.sectionName,
            );
            if (sectionIndex === -1) {
              // The section has no content yet.
              instance.content.push(instanceContent);
            } else {
              instance.content.splice(sectionIndex, 0, instanceContent);
            }
            let contentIndex = 0;

            const updatedReport = {
              ...values,
              instances: values.instances.map((instance) => ({
                ...instance,
                content: instance.content.map((c, i) => {
                  if (c.sectionName === row.sectionName) {
                    return { ...c, sortOrder: contentIndex++ };
                  }
                  return c;
                }),
              })),
            };

            // Update the report instances with the latest content.
            const reportResult = await updateReport(updatedReport, true);
            if (reportResult) setValues(toForm(reportResult));
          } else {
            setValues({
              ...values,
              instances: values.instances.map((instance, index) =>
                index === 0
                  ? {
                      ...instance,
                      content: instance.content.map((c) =>
                        c.contentId === contentResult.id ? { ...c, content: contentResult } : c,
                      ),
                    }
                  : instance,
              ),
            });
          }
        }
      } catch {
      } finally {
        setSubmitting(false);
      }
    },
    [addContent, setActiveRow, setSubmitting, setValues, updateContent, updateReport],
  );

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (!form?.content) return;
      if (e.code === 'Escape') setActiveRow(undefined);
      // added metaKey support for MAC
      // allows use of Command key as well as Control key for windows
      else if (e.ctrlKey || e.metaKey) {
        if (e.code === 'Enter') handleAddUpdateContent(values, form);
        else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') {
          onNavigate(instance, 'previous');
          e.stopImmediatePropagation();
          e.preventDefault();
        } else if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
          onNavigate(instance, 'next');
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      }
    },
    [form, handleAddUpdateContent, onNavigate, instance, setActiveRow, values],
  );

  // refresh the window event listener anytime the handler changes due to content changes
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!form?.content) return <></>;

  return (
    <styled.ContentEditForm>
      <div>
        <h1>Edit story</h1>
        <Button
          variant="info"
          onClick={() => {
            setForm(undefined);
            setActiveRow(undefined);
          }}
        >
          <FaX />
        </Button>
      </div>
      {form && !!form.content.id && (
        <Bar className="content-bar">
          <Col className="byline">by {form.content.byline}</Col>
          <Col className="date">{formatDate(form.content.publishedOn, true)}</Col>
          <Col flex="1"></Col>
          <Col className="source">
            {form.content.source?.name ?? form.content.otherSource}
            {form.content.contentType === ContentTypeName.PrintContent && form.content.page
              ? ` | ${form.content.page}`
              : ''}
          </Col>
          <Col className="sentiment">
            <Sentiment
              value={form.content.tonePools.length ? form.content.tonePools[0].value : undefined}
              showValue
            />
          </Col>
        </Bar>
      )}
      <div>
        <p>
          Changes made here to the headline or story will be reflected in your reports. The summary
          will display if it has been enabled in the report template.
        </p>
      </div>
      {form.content?.ownerId === userId && form.content?.isPrivate ? (
        <UserContentForm
          errors={errors}
          content={form}
          show={'all'}
          onContentChange={(content) => {
            setForm({ ...content });
          }}
          loading={isSubmitting}
          disabled={disabled}
        />
      ) : (
        <ContentForm
          content={form.content}
          show={'all'}
          onContentChange={(content) => {
            setForm({ ...form, content });
          }}
          loading={isSubmitting}
          disabled={disabled}
        />
      )}
      <ContentActions
        content={form.content}
        disabled={disabled}
        onCancel={() => {
          setForm(undefined);
          setActiveRow(undefined);
        }}
        onUpdate={() => handleAddUpdateContent(values, form)}
        onNavigate={(action) => onNavigate(instance, action)}
      />
    </styled.ContentEditForm>
  );
};
