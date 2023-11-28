

export const currencyFormat = (value: number) => {

    const formatter = new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return formatter.format(value);

}