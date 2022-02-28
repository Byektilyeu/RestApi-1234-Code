const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "comment",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      bookId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "book",
          key: "id",
        },
      },
      comment: {
        type: DataTypes.STRING(450),
        allowNull: false,

        notContain: {
          len: {
            args: ["миа"],
            msg: "энэ мессежид хориотой үг ашиглагдсан байна",
          },
        },

        // Commentiig ehnii usgiig tomoor, busad hesgiin buh text-iig jijig useg gesen format-tai bolgoj bna
        get() {
          let comment = this.getDataValue("comment").toLowerCase();
          return comment.charAt(0).toUpperCase() + comment.slice(1);
        },
        // tuhain commentiin horiotoi ug baival, teriig automataar busad ugeer solih
        set(value) {
          this.setDataValue("comment", value.replace("миа", "тиймэрхүү"));
        },
      },
    },
    {
      sequelize,
      tableName: "comment",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "FK_comment_1",
          using: "BTREE",
          fields: [{ name: "userId" }],
        },
        {
          name: "FK_comment_2",
          using: "BTREE",
          fields: [{ name: "bookId" }],
        },
      ],
    }
  );
};
