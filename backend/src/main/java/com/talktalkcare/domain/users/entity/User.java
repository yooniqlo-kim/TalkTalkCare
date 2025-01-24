package com.talktalkcare.domain.users.entity;

import jakarta.persistence.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.util.Date;

@Entity
@Table(name="users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;

    @NotNull
    @Column(length=50)
    private String loginId;

    @NotNull
    private String password;

    @NotNull
    private String token;

    @NotNull
    @Column(length=10)
    private String name;

    @NotNull
    private Date birth;

    @NotNull
    @Column(length=11)
    private String phone;

    @NotNull
    private Date loginedAt;

    @NotNull
    @Column(name="s3_filename")
    private String s3FileName;
}