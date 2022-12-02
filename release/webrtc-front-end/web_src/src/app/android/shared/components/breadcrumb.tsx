import { Breadcrumb } from 'antd';
import React, { useEffect, useState, ReactElement } from 'react';

import { breadcrumbStyles, BreadcrumbLinkTxt } from '../styles/panel-styles';

const renderBreadcrumb = (callback: Function, path?: string): ReactElement[] | null => {
  const assignationDir = (value: string): void => {
    if (callback) {
      callback(value);
    }
  };

  if (path) {
    const pathSnippets = path.split('/').filter((i): string => i);

    return pathSnippets.map(
      (value, index): ReactElement => {
        const pathUrl = pathSnippets.slice(0, index + 1).join('/');

        if (value === pathSnippets[pathSnippets.length - 1]) {
          return (
            <Breadcrumb.Item key={pathUrl}>
              <span>{value}</span>
            </Breadcrumb.Item>
          );
        } else {
          return (
            <Breadcrumb.Item key={pathUrl} onClick={(): void => assignationDir(pathUrl)}>
              <BreadcrumbLinkTxt>{value}</BreadcrumbLinkTxt>
            </Breadcrumb.Item>
          );
        }
      }
    );
  }
  return null;
};

export function FileBreadcrumb(props: { path?: string; callback: Function }): ReactElement {
  const [content, setContent] = useState<ReactElement[] | null>(null);

  useEffect((): void | (() => void | undefined) => {
    setContent(renderBreadcrumb(props.callback, props.path));
  }, [props.callback, props.path]);

  return <Breadcrumb style={breadcrumbStyles}>{content}</Breadcrumb>;
}
