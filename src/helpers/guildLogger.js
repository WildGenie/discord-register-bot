import { Colors, EmbedBuilder } from "discord.js";

import Setting from "#schemas/setting";

async function userRoleLog(client, guild, member, roles, codeId) {
  Setting.getValueByKey(guild.id, "Channel:Log").then(async (setting) => {
    if (!setting) {
      client.logger.error(`Ayarlar: Channel:Log ayarı bulunamadı.`);
      return;
    }
    const channel = guild.channels.cache.find((c) => c.id === setting.value);

    if (!channel) {
      client.logger.error(`Ayarlar: Channel:Log ayarı olan ${setting.value} kanalı bulunamadı.`);
      return;
    }
    if (!channel.isTextBased()) {
      client.logger.error(
        `Ayarlar: Channel:Log ayarı olan ${setting.value} kanalı metin kanalı değil.`
      );
      return;
    }

    if (!client.user) {
      return;
    }

    // TODO: Log kanalına gönderilen embedler güncellencek
    const logEmbed = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setThumbnail(member.displayAvatarURL())
      .addFields([
        {
          name: `${member.displayName} Kullanıcısı Kayıt Oldu`,
          value: `${member} ${codeId} kullanarak kayıt oldu.\nKullanıya şu roller atandı:\n${roles
            .map((role) => `<@&${role.id}>`)
            .join(", ")}`, // TODO: user role should be shown here
          inline: false,
        },
      ]);
    await channel.send({
      embeds: [logEmbed],
    });
  });
}

export { userRoleLog };