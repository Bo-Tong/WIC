import styled from 'styled-components';

// tslint:disable-next-line: variable-name
export const HeaderWrap = styled.header`
  height: 50px;
  display: flex;
  color: white;
  background: #4878af;
  align-items: center;
  padding: 0px 30px;
  justify-content: space-between;
`;

// tslint:disable-next-line: variable-name
export const HeaderRight = styled.div`
  > span:nth-of-type(1) {
    margin-right: 15px;
  }

  > span:nth-of-type(2) {
    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  }
`;
