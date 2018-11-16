import {Modal} from 'materialize-css';


const areYouSureModal = Modal.init(document.getElementById('modalAreYouSure')!);

export function areyousure(content: string): Promise<boolean> {
  return new Promise((resolve) => {
    areYouSureModal.el.querySelector('.are-you-sure')!.innerHTML = content;
    areYouSureModal.el.querySelector<HTMLElement>('.are-you-sure-confirm')!.onclick = () => resolve();
    areYouSureModal.open();
  });
}
