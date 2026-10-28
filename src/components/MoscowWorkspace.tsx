import { links } from '../config/links';
import { Workspace } from './Workspace';

export function MoscowWorkspace() {
  return (
    <Workspace
      id="rent"
      kicker="Москва"
      title="Аренда рабочего места в Москве"
      text="Рабочее место для мастера в Москве. Подробные условия аренды — на странице по кнопке ниже."
      href={links.rentMoscow}
    />
  );
}
