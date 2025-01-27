package com.talktalkcare.domain.users.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name="user_security")
public class UserSecurity {

    @Id
    private String userLoginId;

    @NotNull
    private String salt;

}
