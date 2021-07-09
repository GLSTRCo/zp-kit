/**
 *
 * @typedef {import('@/blocks/custom-input/methods')} T
 * @export
 * @return {Promise<T>}
 */
export default async function () {
    await import(/* webpackChunkName: "Inputmask" */ 'inputmask');
    const InputMethods = await import(
        /* webpackChunkName: "custom-input-methods" */ '@/blocks/custom-input/methods'
    );

    return InputMethods;
}
