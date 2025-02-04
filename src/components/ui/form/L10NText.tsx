import React from "react";
import l10n, { L10NKey, L10NParams } from "renderer/lib/l10n";

const L10NText = ({
  l10nKey,
  params,
}: {
  l10nKey: L10NKey;
  params?: L10NParams | undefined;
}) => {
  return <>{l10n(l10nKey, params)}</>;
};

export default L10NText;
