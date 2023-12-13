import AdditionalStats from "../json/artefacts_groups.json";
import artefactsAdditionalPropsOld from "../artefactsAdditionalProps.json";

export const parseAdditionalStats = (key: string, name: string) => {
    const stats: any[] = [];
    const slicedKey = key.replace('item.art.', '').replace('.name', '');
    const artefact = AdditionalStats.find(art => art.group === slicedKey);
    const allStats = [...artefactsAdditionalPropsOld.map(props => [...props.additionalStats.map(stat => {
        return {lines: stat.lines, key: stat.key, unitKey: stat.unitKey, isPositive: stat.isPositive}
    })])].flat();

    if (artefact) {
        for (const [key, value] of Object.entries(artefact.factors)) {
            const lines = allStats.find(stat => {
                    return stat.key.includes('.' + key);
            })!;
            const stat = {
                unitKey: lines?.unitKey,
                key: 'stalker.artefact_properties.factor.' + key,
                value: {
                    min: value.min,
                    max: value.max
                },
                lines: lines?.lines,
                isPositive: lines.isPositive
            }
            stats.push(stat);
        }
    }

    return stats;
}
