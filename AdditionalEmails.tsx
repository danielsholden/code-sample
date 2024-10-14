import * as React from 'react';

import cn from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { formatEmailHidden } from '@app/core/src/services/email';
import { loadAdditionalEmails } from '@app/notifications-centre/exposes/actions';
import { AdditionalEmail } from '@app/notifications-centre/exposes/models';
import {
  selectAdditionalEmailsData,
  selectIsLoadedFailed,
} from '@app/notifications-centre/exposes/selectors';
import {
  Grid,
  Input,
  Notification,
  IconName,
  ActionButton,
  Colors,
  toastEmit,
  ToastStatus,
} from '@ui/kit';

import { Description } from '../../../../components/Description';
import { Title } from '../../../../components/Title';
import { Email } from '../Email';

import { Actions } from './components/Actions';
import { DeleteEmail } from './components/DeleteEmail';
import { ADDITIONAL_EMAILS_LIMIT } from './data/constants';
import { ModalType } from './data/models';
import { useConfirmEmail } from './hooks/useConfirmEmail';

import styles from './AdditionalEmails.less';

const AdditionalEmails: React.FC = () => {
  const [modalType, setModalType] = React.useState<ModalType | undefined>();
  const [selectedEmail, setSelectedEmail] = React.useState<AdditionalEmail>();
  const additionalEmails = useSelector(selectAdditionalEmailsData);
  const isLoadedFailed = useSelector(selectIsLoadedFailed);
  const dispatch = useDispatch();
  useConfirmEmail(additionalEmails);

  React.useEffect(() => {
    dispatch(loadAdditionalEmails());
  }, []);

  React.useEffect(() => {
    if (isLoadedFailed) {
      toastEmit(ToastStatus.ERROR, 'Не удалось загрузить список дополнительных email-адресов');
    }
  }, [isLoadedFailed]);

  const showModal = (email: AdditionalEmail, type: ModalType): void => {
    setSelectedEmail(email);
    setModalType(type);
  };

  const closeModal = (): void => {
    setModalType(undefined);
    setSelectedEmail(undefined);
  };

  return (
    <>
      <Title>Дополнительные email-адреса</Title>
      <Description>
        Добавьте личный email или email сотрудника, чтобы получать важные письма &nbsp;
        удобным способом. Настроить, какие именно уведомления будут приходить на&nbsp;дополнительный
        адрес, можно на&nbsp;вкладке &laquo;Уведомления&raquo;.
      </Description>
      <Grid.Row>
        {additionalEmails.map((email) => (
          <Grid.Col key={email.notificationEmailId}>
            <Input
              value={formatEmailHidden(email.emailAddress)}
              testId="settingsAdditionalEmailInput"
              className={cn({ [styles.unconfirmed]: !email.confirmTime || !email.signTime })}
              action={<Actions email={email} showModal={showModal} />}
              disabled
              small
            />
          </Grid.Col>
        ))}
      </Grid.Row>
      <Grid.Row>
        <Grid.Col>
          {additionalEmails.length >= ADDITIONAL_EMAILS_LIMIT ? (
            <Notification icon={IconName.Info} type="info" testId="limitedEmailsNotification">
              Достигнуто максимальное количество дополнительных адресов электронной почты
            </Notification>
          ) : (
            <ActionButton
              onClick={() => setModalType(ModalType.Add)}
              iconName={IconName.Add}
              iconColor={Colors.BlueMain}
              iconHover={Colors.BlueHover}
              testId="addAdditionalEmail"
            >
              Добавить email
            </ActionButton>
          )}
        </Grid.Col>
      </Grid.Row>
      {modalType === ModalType.Add && <Email email={selectedEmail} onClose={closeModal} />}
      {modalType === ModalType.Delete && (
        <DeleteEmail
          emailId={selectedEmail?.notificationEmailId ?? ''}
          additionalEmails={additionalEmails}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default React.memo(AdditionalEmails);
