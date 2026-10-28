import { links } from '../config/links';
import { Workspace } from './Workspace';

export function MytishchiWorkspace() {
  return (
    <Workspace
      id="rent-mytishchi"
      kicker="Мытищи"
      title="Аренда рабочего места в коворкинге в Мытищах"
      text="Рабочее место для мастера в коворкинге в Мытищах. Подробные условия аренды — на странице по кнопке ниже."
      href={links.rentMytishchi}
    />
  );
}
