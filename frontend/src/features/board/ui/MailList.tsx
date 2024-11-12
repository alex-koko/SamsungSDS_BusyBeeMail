import React, { useEffect } from 'react';
// import { ReactComponent as ReplyIcon } from 'shared/assets/icons/reply.svg';
import { ReactComponent as ArrowIcon } from 'shared/assets/icons/arrow.svg';
import { fetchEmailsByReceiver } from 'features/board/api/boardApi'; // API 호출 함수
import styles from './MailList.module.scss';
import useMailStore from '../utils/mailStore';
import { getNickname } from 'shared/utils/getNickname';
import { getTagColor, getTagName } from 'shared/utils/getTag';
import BoardLayout from 'features/board/ui/BoardLayout';
import { useAuth } from 'features/auth/hooks/useAuth';

interface MailListProps {
  className?: string;
}

export const MailList: React.FC<MailListProps> = ({ className = '' }) => {
  // Zustand Store에서 상태 가져오기
  const mails = useMailStore((state) => state.mails);
  const setMails = useMailStore((state) => state.setMails);

  // useAuth 훅을 사용하여 이메일 가져오기
  const [, email] = useAuth() || []; // 구조 분해 할당으로 이메일만 가져옴

  useEffect(() => {
    const loadMails = async () => {
      // email이 없으면 메일을 로드하지 않음
      if (!email) return;

      try {
        // email이 배열일 경우 첫 번째 값을 사용하거나, 기본 이메일 주소를 사용
        // const singleEmail = Array.isArray(email) ? email[0] : email;
        const data = await fetchEmailsByReceiver('test@busybeemail.net');

        // API 응답 구조 출력
        console.log('Fetched data:', data);

        // data가 배열인지 확인하고, 메일이 없는 경우 처리
        if (!Array.isArray(data)) {
          setMails([]); // 메일이 없는 경우 빈 배열로 설정
        } else {
          // 메일 데이터를 파싱하여 nickname과 email 속성을 추가
          const parsedData = data.map((mail) => {
            const { nickname, email } = getNickname(mail.sender);
            return { ...mail, nickname, email };
          });

          setMails(parsedData); // 상태에 저장
        }
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };

    // 컴포넌트가 마운트될 때 딱 한 번만 메일을 로드
    if (email) {
      loadMails();
    }
  }, [email]); // email이 설정될 때만 호출

  // 데이터 구조 확인을 위해 콘솔 로그 출력
  if (mails.length > 0) {
    console.log('MAILS: ', mails);
  }

  return (
    <BoardLayout>
      <div className={`${styles.mailList} ${className}`}>
        <div className={styles.header}>
          <div className={styles.actions}>
            <input type='checkbox' />
          </div>
          <div className={styles.pageInfo}>
            <p>
              {mails.length}개 중 1-{mails.length}
            </p>
            <button className={styles.navButton}>
              <ArrowIcon width={24} height={24} />
            </button>
            <button className={`${styles.navButton} ${styles.rotate}`}>
              <ArrowIcon width={24} height={24} />
            </button>
          </div>
        </div>
        {mails.length === 0 && <div>받은 메일이 없습니다.</div>}
        {mails.length !== 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{''}</th>
                <th>보낸 사람</th>
                <th>태그</th>
                <th>제목</th>
                <th>보낸 시각</th>
              </tr>
            </thead>
            <tbody>
              {mails.map((mail, index) => (
                <tr key={index}>
                  <td>
                    <input type='checkbox' />
                  </td>
                  <td className={styles.sender}>
                    {mail.nickname} <br />
                    {mail.email}
                  </td>
                  {/* 값이 제대로 렌더링되지 않으면 확인 */}
                  <td
                    className={styles.tag}
                    style={{ backgroundColor: getTagColor(mail.flag) }}
                  >
                    {getTagName(mail.flag)}
                  </td>
                  <td className={styles.subject}>
                    <a
                      href={`/mail/detail?receiver=${mail.receiver}&received_date=${mail.received_date}`}
                    >
                      {mail.subject}
                    </a>
                    {/* 값이 제대로 렌더링되지 않으면 확인 */}
                  </td>
                  <td className={styles.timestamp}>
                    {mail.received_date || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </BoardLayout>
  );
};

export default MailList;
