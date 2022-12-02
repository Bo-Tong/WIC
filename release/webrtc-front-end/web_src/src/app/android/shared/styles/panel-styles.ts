import { CSSProperties } from 'react';
import styled from 'styled-components';

// tslint:disable-next-line: variable-name
export const PanelContainer = styled.div`
  display: flex;
  flex-flow: column;
  height: calc(100vh - 50px);
`;

export const containerStyle: CSSProperties = {
  backgroundColor: 'grey'
};

export const bg = {
  backgroundColor: 'white'
};

export const resizeStream = {
  top: false,
  right: false,
  bottom: true,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false
};

// tslint:disable-next-line: variable-name
export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  background: white;
  border-bottom: 1px solid #cccccc;
`;

// tslint:disable-next-line: variable-name
export const SectionTitle = styled.span`
  font-size: 16px;
  color: #858585;

  > span {
    color: black;
    margin-right: 5px;
  }
`;

// tslint:disable-next-line: variable-name
export const ButtonGroupContainer = styled.div`
  display: flex;
  justify-content: space-between;

  button {
    margin-left: 10px;
  }
`;

// tslint:disable-next-line: variable-name
export const VideoContainer = styled.div`
  display: flex;
  position: relative;
  height: calc(100vh - 96px);

  video {
    position: absolute;
    width: 100%;
    max-width: calc((100vh - 96px) * 1.6);
    max-height: calc(100vh - 96px);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  video::-webkit-media-controls {
    display: none !important;
  }

  video:not(:root):fullscreen {
    object-fit: fill;
  }

  + div {
    > div {
      bottom: 0 !important;
      height: 5px !important;
      background: #99999980 !important;
      &:hover {
        background: #a1a1a1 !important;
      }
    }
  }
`;

export const controlSectionStyles = {
  height: '100%'
};

export const controlTabPanelStyles = {
  padding: 10,
  backgroundColor: 'white',
  fontSize: 14,
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden'
};

// tslint:disable-next-line: variable-name
export const CustomControlSection = styled.div`
  position: relative;
  min-height: 0;
  height: 100%;
  z-index: 3;

  .ant {
    &-tabs {
      &-nav {
        margin: 0;
        background: white;
      }

      &-nav-wrap {
        padding: 0 10px;
      }

      &-content-holder {
        overflow: auto;
        padding: 10px;
        background: #f6f6f6;
      }

      &-content {
        height: 100%;
      }
    }

    &-upload.ant-upload-drag {
      height: auto;
    }
  }

  .ant-tabs-tab {
    padding: 12px 10px;

    &:hover {
      background: #f0f0f0;
    }
  }

  .ant-tabs-ink-bar {
    background: #f9826c;
  }

  .xterm .xterm-viewport {
    overflow-y: auto;
  }
`;

// tslint:disable-next-line: variable-name
export const CustomTab = styled.span`
  color: #24292e;
  font-size: 13px;

  > span {
    font-size: 16px;
    color: #959da5;
  }
`;

// tslint:disable-next-line: variable-name
export const TerminalPanel = styled.pre`
  display: block;
  padding: 9.5px;
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.42857143;
  word-break: break-all;
  word-wrap: break-word;
  color: #fefefe;
  background: #444;
  border: 1px solid #ccc;
  border-radius: 4px;
  user-select: none;
`;

// tslint:disable-next-line: variable-name
export const SharedButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 5px;
`;

// tslint:disable-next-line: variable-name
export const FileNameWrapper = styled.div`
  span:nth-child(1) {
    margin-right: 10px;
  }

  span:nth-child(2): hover {
    color: #0366d6;
    text-decoration: underline;
    cursor: pointer;
  }
`;

export const fileExplorerStyles = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 5
};

export const progressStyles = {
  color: '#757575'
};

export const uploadSwitchStyles = {
  marginBottom: 5
};

export const uploadSubStyles = {
  color: '#9a9a9a',
  fontSize: 12
};

export const breadcrumbStyles = {
  fontWeight: 600,
  fontSize: 16,
  marginLeft: 10
};

// tslint:disable-next-line: variable-name
export const BreadcrumbLinkTxt = styled.span`
  &:hover {
    border-bottom: 2px solid;
    padding-bottom: 2px;
    cursor: pointer;
  }
`;

// tslint:disable-next-line: variable-name
export const LoadingMsg = styled.div`
  display: block;
  overflow: hidden;
  white-space: nowrap;
  padding-top: 240px;
  text-align: center;
`;

// tslint:disable-next-line: variable-name
export const ShellContainer = styled.div`
  height: 100%;
  background: black;
`;

export const testCaseItemStyles: CSSProperties = {
  cursor: 'pointer'
};

export const testCaseBackStyles: CSSProperties = {
  color: '#468afb',
  marginRight: 5
};
