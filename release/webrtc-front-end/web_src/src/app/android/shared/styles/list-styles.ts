import styled from 'styled-components';

// tslint:disable-next-line: variable-name
export const AndroidContainer = styled.div`
  padding: 15px;
  position: relative;

  .ant-table-wrapper {
    th.ant-table-cell {
      border-bottom: 2px solid #ddd;
      border-top: 1px solid #f0f0f0;
    }

    td.ant-table-cell {
      span:nth-child(1) {
        color: #6b6b6b;
        margin-right: 8px;
      }
    }
  }
`;
